import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.AI_KEY,
});

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

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
    });

    return response.text;
};

export const summariseCodeBatch = async (docsBatch) => {
    console.log(`getting summary of batch of ${docsBatch.length} files`);
    const filedata = docsBatch.map((doc, index) => ({
        index: index + 1,
        fileName: doc.metadata.source,
        code: doc.pageContent.slice(0, 10000)
    }));
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `
You are a senior software engineer onboarding a junior developer.
You will be given MULTIPLE source files.
Your task is to summarize EACH file clearly and concisely.

### Instructions:
- Analyze each file independently
- Do NOT mention that this is AI-generated
- Do NOT repeat the code    
- Keep each summary under 500 words
- Return ONLY valid JSON
- The output MUST be an array
- Preserve the fileName exactly as provided
- Do NOT add extra keys

### Input files:
${JSON.stringify(filedata, null, 2)}

### Output format (STRICT):
[
  {
    "fileName": "example.js",
    "summary": "Short explanation of what this file does"
  }
]
`,
    });

    const raw = response.text;
    const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}
export const summariseCode = async (doc) => {
    console.log("getting summary for", doc.metadata.source);

    const code = doc.pageContent.slice(0, 10000);

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.
You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.

Here is the code:
---
${code}
---

Give a summary no more than 100 words of the code above.`,
    });

    return response.text;
};

export const getEmbeddings = async (summary) => {
    const result = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: summary,
    });

    return result.embeddings[0].values;
};

export const getQuerySummary = async (context, question) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `
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
- Responses must be between **100 words** — concise yet complete.
- If the CONTEXT BLOCK provides the answer, base your response only on that context.
- If the CONTEXT BLOCK does NOT provide the answer, respond exactly with: "I'm sorry, but I don't know the answer."
- Do not invent or assume facts not supported by the CONTEXT BLOCK.
- Use Markdown formatting (headings, bullets, code fences where relevant).
- Be professional, clear, and encouraging — suitable for mentoring a technical intern.
`,
    });

    return response.text;
};