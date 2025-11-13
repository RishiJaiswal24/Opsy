import { auth } from "@clerk/nextjs/server";
import connectDB from "@/app/db/connectDb";
import Question from "@/app/models/Question";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { projectId } = await req.json();

  const questionLog = await Question.find({ userId, projectId }).lean();
  return Response.json(questionLog);
}
