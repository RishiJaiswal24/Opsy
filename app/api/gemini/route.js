import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash'
})

export const aiSummariseCommit = async (diff) => {
    const prompt = `You are an expert programmer summarizing a git diff.

INSTRUCTIONS:
1. Analyze the git diff format where:
   - Lines starting with '+' are additions
   - Lines starting with '-' are deletions
   - File paths appear after 'diff --git'
   
2. Create a bullet-point summary with:
   - Specific changes made (what was added, removed, or modified)
   - Affected file names in square brackets [file.js]
   - Technical details about the changes
   
3. Format your response as bullet points starting with '*'
4. Be specific and detailed - include function names, variable names, and technical changes
5. Each bullet should be a complete sentence describing one logical change

EXAMPLE OUTPUT FORMAT:
* Refactored authentication logic to use JWT tokens instead of sessions [auth.js], [middleware.js]
* Added error handling for database connection failures [db/connect.js]
* Updated API endpoint from /api/users to /api/v2/users [routes.js]
* Increased maximum file upload size from 5MB to 10MB [config.js]

Now summarize this diff:

${diff}`;

    const response = await model.generateContent([prompt]);
    return response.response.text();
};


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