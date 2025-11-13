import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import connectDB from "@/app/db/connectDb";
import { getEmbeddings, getQuerySummary } from "../gemini/route";
import CodeEmbeddings from "@/app/models/CodeEmbeddings";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.AI_KEY,
});

function cosineSimilarity(a, b) {
  if (a.length !== b.length) throw new Error("Embedding dimensions must match");
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export async function POST(req) {
  try {
    const { question, projectId } = await req.json();

    await connectDB();

    const queryVector = await getEmbeddings(question);

    const docs = await CodeEmbeddings.find({ projectId }).lean();

    if (!docs || docs.length === 0) {
      return Response.json(
        { error: "No documents found for this projectId" },
        { status: 404 }
      );
    }

    const results = docs.map((doc) => ({
      sourceCode: doc.sourceCode,
      fileName: doc.fileName,
      summary: doc.summary,
      similarity: cosineSimilarity(queryVector, doc.summaryEmbedding),
    }));

    const topMatches = results
      .filter((r) => r.similarity > 0.4)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    let context = "";
    for (const doc of topMatches) {
      context += `source: ${doc.fileName}\ncode context: ${doc.sourceCode}\nsummary: ${doc.summary}\n\n--\n\n`;
    }

    const querySummary = await getQuerySummary(context, question);

    return Response.json({
      success: true,
      querySummary,
      topMatches,
    });
  } catch (err) {
    console.error("Error in queryVectorSearch:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
