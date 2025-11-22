import { NextResponse } from "next/server";
import { indexGithubRepo } from "../github-loadier/route";
import Project from "@/app/models/Project";
import User from "@/app/models/User";
import connectDB from "@/app/db/connectDb";

export async function POST(req) {
  try {
    await connectDB();

    const { projectId } = await req.json();
    if (!projectId) throw new Error("projectId is required");

    // Find project
    const project = await Project.findOne({ projectId });
    if (!project) throw new Error("Project not found");

    // Find user
    const user = await User.findOne({ userId: project.userId });
    if (!user) throw new Error("User not found");

    const requiredCredits = project.fileCount || 0;

    // Check credits
    if (user.credits < requiredCredits) {
      return NextResponse.json(
        { success: false, error: "Not enough credits" },
        { status: 400 }
      );
    }

    // Update project → processing
    project.processingStatus = "processing";
    await project.save();

    try {
      // PROCESS REPO
      await indexGithubRepo(projectId, project.projectUrl, process.env.GITHUB_TOKEN);

      // Deduct credits
      user.credits -= requiredCredits;
      await user.save();

      // Update status → completed
      project.processingStatus = "completed";
      await project.save();

      return NextResponse.json({
        success: true,
        message: "Repository processed successfully",
      });

    } catch (err) {
      console.error("Processing failed:", err);

      project.processingStatus = "failed";
      await project.save();

      return NextResponse.json(
        { success: false, error: "Processing failed" },
        { status: 500 }
      );
    }

  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
