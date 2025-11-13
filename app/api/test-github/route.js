import { NextResponse } from "next/server";
import { indexGithubRepo } from "../github-loadier/route";

export async function POST(req) {
  try {
    const projectId = "38904c23-0795-4916-9d68-13d99eae0acc";
    const githubUrl = "https://github.com/RishiJaiswal24/FanPulse";
    const githubToken = process.env.GITHUB_TOKEN || ""; 

    await indexGithubRepo(projectId, githubUrl, githubToken);

    return NextResponse.json({ success: true, message: "Repo indexed successfully!" });
  } catch (error) {
    console.error("Error in test-github route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
