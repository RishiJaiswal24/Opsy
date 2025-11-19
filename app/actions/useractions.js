"use server"
import { v4 as uuidv4 } from "uuid"
import connectDB from "../db/connectDb"
import Project from "../models/Project"
import { auth } from "@clerk/nextjs/server"
import Commit from "../models/Commit"
import Question from "../models/Question"
import Meetings from "../models/Meetings"
import { connect } from "mongoose"
import CodeEmbeddings from "../models/CodeEmbeddings"

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

// for meeitngs

export const fetchIssues = async (MeetingsId) => {
    const { userId } = await auth();
    try {
        if (!userId) {
            throw new Error("unauthorized")
        }
        if (!MeetingsId) {
            throw new Error("MeetingsId is need")
        }
        await connectDB()
        const meeting = await Meetings.findOne({ MeetingsId }).lean()
        return JSON.parse(JSON.stringify(meeting))
    } catch {
        console.error("Error fetching issues:", err);
        return [];
    }
}

export const deleteMeeting = async (MeetingsId) => {
    await connectDB()
    await Meetings.deleteOne({ MeetingsId })
}

export const saveMeeting = async (projectId, meetingUrl, name) => {
    const { userId } = await auth();
    try {
        await connectDB()
        if (!userId) {
            throw new Error("Unauthorized")
        }
        if (!meetingUrl) {
            throw new Error("No meetingid present")
        }
        if (!name) {
            throw new Error("No name present")
        }
        const savedMeeting = new Meetings({
            MeetingsId: uuidv4(),
            userId,
            projectId,
            meetingUrl,
            name,
            status: "Processing",
        })
        await savedMeeting.save()

        return {
            success: true,
            MeetingsId: savedMeeting.MeetingsId,
            message: "Meeting saved successfully!",
        };
    } catch (error) {
        console.error("Error saving meeting:", error);
        return {
            success: false,
            message: error.message || "Failed to save meeting."
        };
    }
}

export const fetchMeetingsProjectId = async (projectId) => {
    const { userId } = await auth();
    try {
        if (!userId) {
            throw new Error("Unauthorized")
        }
        await connectDB()
        const meetings = await Meetings.find({ projectId }).lean();
        return JSON.parse(JSON.stringify(meetings))
    } catch {

    }
}

//for dashboard

// top right buttons
export const projectDelete = async (projectId) => {
    const { userId } = await auth();
    try {
        if (!userId) {
            throw new Error("Unauthorised")
        }
        if (!projectId) {
            throw new Error("Project Id is required for deletion")
        }
        await connectDB();
        await CodeEmbeddings.deleteMany({ projectId })
        await Commit.deleteMany({ projectId })
        await Question.deleteMany({ projectId });
        await Project.deleteOne({ projectId });
        return { success: true };
    } catch (error) {
        console.error("Delete Project Error:", error);
        throw new Error(error.message || "Error deleting project");
    }
}

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
