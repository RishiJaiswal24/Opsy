import { config } from 'dotenv';
import { AssemblyAI } from "assemblyai";
config({ path: ['.env.local', '.env'] });

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
console.log(process.env.ASSEMBLYAI_API_KEY);
function msToTime(ms) {
    const seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export const processMeetings = async (meetingUrl) => {
    if (!meetingUrl) throw new Error("Meeting URL is required");

    const transcript = await client.transcripts.transcribe({
        audio: meetingUrl,
        auto_chapters: true,
    });

    if (!transcript.text) {
        throw new Error("No transcript found");
    }

    const summaries =
        transcript.chapters?.map((chapter) => ({
            start: msToTime(chapter.start),
            end: msToTime(chapter.end),
            gist: chapter.gist,
            headline: chapter.headline,
            summary: chapter.summary,
        })) || [];

    return { transcript, summaries };
};
