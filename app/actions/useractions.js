"use server"
import { v4 as uuidv4 } from "uuid"
import connectDB from "../db/connectDb"
import Project from "../models/Project"
import { auth } from "@clerk/nextjs/server"
import Commit from "../models/Commit"
import Question from "../models/Question"

export const saveQuestion = async ({ projectId, question, answers, fileRefrenced }) => {
    const { userId } = await auth();
    try {
        await connectDB()
        if (!userId) {
            throw new Error("Unauthorized ")
        }

        const savedQuestion = new Question({
            questionId: uuidv4(),
            userId,
            projectId,
            question,
            answers,
            fileRefrenced
        })

        await savedQuestion.save()

        return {
            success: true,
            message: "Question saved successfully!",
        };
    } catch (error) {
        console.error("Error saving question:", error);
        return {
            success: false,
            message: error.message || "Failed to save question."
        };
    }
}

//for dashboard

export const fetchCommitLog = async (projectId) => {
    await connectDB()
    const commits = await Commit.find({ projectId }).lean()

    return JSON.parse(JSON.stringify(commits))
}

//for create Project
export const createProject = async ({ ProjectName, GithubRepo }) => {
    const { userId } = await auth();
    try {
        await connectDB();

        if (!userId) {
            throw new Error("Unauthorized ");
        }

        if (!ProjectName || !GithubRepo) {
            throw new Error("Both ProjectName and GithubRepo are required.");
        }

        const project = new Project({
            projectId: uuidv4(),
            name: ProjectName,
            projectUrl: GithubRepo,
            userId
        });

        await project.save();

        return {
            success: true,
            message: "Project created successfully!",
        };
    } catch (error) {
        console.error("Error creating project:", error);
        return {
            success: false,
            message: error.message || "Failed to create project."
        };
    }
};
