import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { getEmbeddings, summariseCode } from '../gemini/route';
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
            } else {
                console.error("Gemini API call failed:", err.message);
                throw err;
            }
        }
        retries--;
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

            // Docs / text
            'README.*', 'readme.*', 'LICENSE', 'LICENSE.*', 'CONTRIBUTING.*',
            'CHANGELOG.*', 'CODE_OF_CONDUCT.*', 'SECURITY.*',
            '*.md', '*.txt', '*.rst',

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


export const indexGithubRepo = async (projectId, githubUrl, githubToken) => {
    console.log(` Starting index for repo: ${githubUrl}`);
    const docs = await loadGithubRepo(githubUrl, githubToken);

    const allEmbeddings = await generateEmbeddings(docs);

    console.log(" Connecting to MongoDB...");
    await connectDB();

    console.log(" Storing embeddings in DB...");
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

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        console.log(`🔹 Processing file ${i + 1}/${docs.length}: ${doc.metadata.source}`);

        try {
            const summary = await safeCall(summariseCode, doc);
            const embedding = await safeCall(getEmbeddings, summary);

            results.push({
                summary,
                embedding,
                sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
                fileName: doc.metadata.source,
            });

            await sleep(6000);

        } catch (err) {
            console.error(` Failed for ${doc.metadata.source}:`, err.message);
        }
    }

    return results;
};
