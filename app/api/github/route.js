import { config } from 'dotenv';
import { v4 as uuidv4 } from "uuid"
config({ path: ['.env.local', '.env'] });
import connectDB from "@/app/db/connectDb";
import Project from "@/app/models/Project";
import Commit from "@/app/models/Commit";
import { Octokit } from "octokit";
import axios from 'axios';
import { aiSummariseCommit } from '../gemini/route';
import { connect } from 'mongoose';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

// const githubUrl = "https://github.com/docker/genai-stack";

export const getCommitHashes = async (githubUrl) => {
    const [owner, repo] = githubUrl.split('/').slice(-2)
    if (!owner || !repo) {
        throw new Error("Invalid Github Url")
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    });

    const sortedCommits = data.sort((a, b) => {
        return new Date(b.commit.author.date) - new Date(a.commit.author.date);
    });
    const top10 = sortedCommits.slice(0, 10);

    return top10.map(commit => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? ""
    }))
};

export const pollCommits = async (projectId) => {
    const { project, githubUrl } = await fetchProjectAndGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl)
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
    const summarisedCommit = await Promise.allSettled(
        unprocessedCommits.map(commit => summarizeCommit(githubUrl, commit.commitHash))
    );
    const summaries = summarisedCommit.map(response => {
        if (response.status === 'fulfilled') {
            return response.value
        }
        return ""
    })
    await connectDB()
    const commitsToInsert = summaries.map((summary, index) => ({
        commitId: uuidv4(),
        projectId,
        commitMessage: unprocessedCommits[index]?.commitMessage,
        commitHash: unprocessedCommits[index]?.commitHash,
        commitAuthorName: unprocessedCommits[index]?.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]?.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]?.commitDate,
        summary,
    }));
    await Commit.insertMany(commitsToInsert);
    return commitsToInsert;
}

// Helping funcitons 

// use ai to take out summarize the commit 
async function summarizeCommit(githubUrl, commitHash) {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    })
    return await aiSummariseCommit(data);
}


// fetch using projectId 
async function fetchProjectAndGithubUrl(projectId) {
    await connectDB();
    const project = await Project.findOne({ projectId });
    if (!project) {
        throw new Error("Project doent exist")
    }
    if (!project?.projectUrl) {
        throw new Error("Project has no github url");
    }
    return {
        project,
        githubUrl: project.projectUrl
    }
}

// take out unprocessed commits looking into data base
async function filterUnprocessedCommits(projectId, commitHashes) {
    await connectDB();

    const existingCommits = await Commit.find({ projectId }).select("commitHash");

    const existingHashes = new Set(existingCommits.map(c => c.commitHash));

    const unprocessedCommits = commitHashes.filter(
        (commit) => !existingHashes.has(commit.commitHash)
    );

    return unprocessedCommits;
}