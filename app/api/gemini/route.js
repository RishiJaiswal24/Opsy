import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash'
})

export const aiSummariseCommit = async (diff) => {
    const response = await model.generateContent([
        `
        You are an expert programmer, and you are trying to summarize a git diff.

Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
    diff --git a/lib/index.js b/lib/index.js
index aadf891..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.

EXAMPLE SUMMARY COMMENTS:
* Raised the amount of returned recordings from \`10\` to \`100\`. [packages/server/recordings_api.ts], [packages/server/constants.ts]
* Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts], [src/index.ts]
* Lowered numeric tolerance for test files

Most commits will have less comments than this examples list.
The last comment does not include the file names,
because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.

Please summarise the following diff file:
\n\n${diff}
        `
    ])

    return response.response.text();
}

export const summariseCode = async (doc) => {
    console.log("getting summary for ", doc.metadata.source);
    const code = doc.pageContent.slice(0, 10000);
    const response = await model.generateContent([
        `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects. 
You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file. 

Here is the code:
---
${code}
---
Give a summary no more than 100 words of the code above.`
    ]);
    return response.response.text()
}

export const getEmbeddings = async (summary) => {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const result = await model.embedContent(summary);
    const embedding = result.embedding
    return embedding.values
}

export const getQuerySummary = async (context, question) => {
    const response = await model.generateContent([`
You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern seeking to understand the codebase.

The AI assistant is a powerful, human-like intelligence with expert knowledge, helpfulness, cleverness, and articulateness. It is well-behaved, well-mannered, friendly, kind, and inspiring, providing vivid and thoughtful responses.

The assistant should take into account any CONTEXT BLOCK provided between the markers below.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

Behavior and constraints:
- Responses must be between **100 words** — con  cise yet complete.
- If the CONTEXT BLOCK provides the answer, base your response only on that context.
- If the CONTEXT BLOCK does NOT provide the answer, respond exactly with: "I'm sorry, but I don't know the answer."
- Do not invent or assume facts not supported by the CONTEXT BLOCK.
- Use Markdown formatting (headings, bullets, code fences where relevant).
- Be professional, clear, and encouraging — suitable for mentoring a technical intern.

    `])

    return response.response.text();
}