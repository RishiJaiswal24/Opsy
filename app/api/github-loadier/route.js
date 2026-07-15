import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { getEmbeddings, summariseCode, summariseCodeBatch } from '../gemini/route';
import connectDB from '@/app/db/connectDb';
import CodeEmbeddings from '@/app/models/CodeEmbeddings';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function safeCall(fn, ...args) {
    let retries = 3;
    while (retries > 0) {
        try {
            return await fn(...args);
        } catch (err) {
            if (err.message.includes("429") || err.message.includes("Too Many Requests")) {
                console.warn(" Gemini rate limit hit. Waiting 60s before retry...");
                await sleep(60000);
                retries--;
            } else {
                console.error("Gemini API call failed:", err.message);
                throw err;
            }
        }
    }
    throw new Error("Gemini call failed after multiple retries");
}

export const loadGithubRepo = async (githubUrl, githubToken) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || "",
        branch: "main",
        ignoreFiles: [
            // Dependency/config
            'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
            'package.json', 'tsconfig.json', 'jsconfig.json',
            'next.config.*', 'vite.config.*', 'webpack.config.*',
            'babel.config.*', 'postcss.config.*', 'tailwind.config.*',
            '.eslint*', '.prettierrc*', '.editorconfig',

            // Git/env/CI/CD
            '.gitignore', '.gitattributes', '.gitmodules',
            '.env', '.env.*', '.github/*', '.gitlab-ci.yml',
            'Dockerfile', 'docker-compose.yml', 'Procfile',

            // Build outputs / IDE stuff
            '.next/*', 'dist/*', 'out/*', 'build/*', 'coverage/*',
            '.vercel/*', '.vscode/*', '.idea/*', '.DS_Store', 'node_modules/*',

            // Assets / binaries
            'public/*', 'assets/*', 'images/*',
            '*.svg', '*.png', '*.jpg', '*.jpeg', '*.ico', '*.gif', '*.mp4', '*.webp', '*.pdf', '*.woff*', '*.ttf',

            // Tests / mocks
            '__tests__/*', 'tests/*', '*.spec.*', '*.test.*', 'mock/*', 'mocks/*', 'fixtures/*',

            // Scripts / misc
            'scripts/*', 'docs/*', '.husky/*', '.lintstagedrc*', 'Makefile', 'gulpfile.*', 'Gruntfile.*',

            // Data / configs
            '*.json', '*.yaml', '*.yml',

            // Platform specific
            'android/*', 'ios/*', 'expo/*', 'app/icon.*', 'app/manifest.*'
        ],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 3,
    });

    const docs = await loader.load();
    console.log(` Loaded ${docs.length} files from repo`);
    return docs;
};

// main function
export const indexGithubRepo = async (projectId, githubUrl, githubToken) => {
    console.log(` Starting index for repo: ${githubUrl}`);
    const docs = await loadGithubRepo(githubUrl, githubToken);

    const allEmbeddings = await generateEmbeddings(docs);

    await connectDB();

    await Promise.allSettled(
        allEmbeddings.map(async (embedding, index) => {
            if (!embedding) return;
            console.log(` [${index + 1}/${allEmbeddings.length}] ${embedding.fileName}`);

            const sourceCodeEmbedding = {
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                summary: embedding.summary,
                projectId,
                summaryEmbedding: embedding.embedding,
            };

            await CodeEmbeddings.create(sourceCodeEmbedding);
        })
    );

    console.log(" Repo indexing complete!");
};


const generateEmbeddings = async (docs) => {
    const results = [];
    const chunks = []
    // creating chunks of the docs for processing
    for (let i = 0; i < docs.length; i += 10) {
        chunks.push(docs.slice(i, i + 10));
    }

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🔹 Processing chunk ${i + 1}/${chunks.length}`);
        try {
            const summaries = await safeCall(summariseCodeBatch, chunk);

            for (let j = 0; j < summaries.length; j++) {
                let n = summaries.length - 1 - j;

                const item = summaries[j];
                const doc = chunk[j];
                const embedding = await safeCall(getEmbeddings, item.summary);
                results.push({
                    summary: item.summary,
                    embedding,
                    sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
                    fileName: item.fileName
                })
            }
            await sleep(12000);
        } catch (err) {
            console.error(`Failed for chunk ${i + 1}:`, err.message);
        }
    }

    return results;
};
