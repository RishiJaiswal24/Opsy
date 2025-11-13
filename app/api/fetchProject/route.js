import connectDB from "@/app/db/connectDb";
import Project from "@/app/models/Project";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  await connectDB();

  const projects = await Project.find({ userId });
  return new Response(JSON.stringify(projects), { status: 200 });
}
