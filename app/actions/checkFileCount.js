"use server";

import { auth } from "@clerk/nextjs/server";
import Project from "../models/Project";
import User from "../models/User";
import { loadGithubRepo } from "../api/github-loadier/route";
import connectDB from "../db/connectDb";


export async function checkFileCount(projectId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        await connectDB()
        const project = await Project.findOne({ projectId });
        const user = await User.findOne({ userId });

        if (!project) return { error: "Project not found" };
        if (!user) return { error: "User not found" };

        if(project.processingStatus==="processing"){
            return { status: project.processingStatus, fileCount: 0 };
        }

        if (project.fileCount > 0) {
            return { status: project.processingStatus, fileCount: project.fileCount };
        }

        if (project.processingStatus === "not_started" || project.processingStatus === "failed") {
            console.log("load repo funciton was called ");
            const files = await loadGithubRepo(project.projectUrl, process.env.GITHUB_TOKEN);
            const fileCount = files.length;

            project.fileCount = fileCount;
            await project.save();

            return { status: project.processingStatus, fileCount };
        }

        return {
            status: project.processingStatus,
            fileCount: project.fileCount,
        };
    } catch (err) {
        return { error: err.message };
    }
}
