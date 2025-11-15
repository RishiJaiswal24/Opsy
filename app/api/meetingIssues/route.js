import connectDB from "@/app/db/connectDb";
import Meetings from "@/app/models/Meetings";
import { processMeetings } from "@/lib/assemblyAi";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
    const { userId } = await auth();
    try {
        if (!userId) {
            return new Response("Unauthorized access")
        }
        const { MeetingsId, meetingUrl } = await req.json();
        if (!MeetingsId || !meetingUrl) {
            return new Response("MeetingsId and meetingUrl are required", { status: 400 });
        }

        await connectDB();

        const result = await processMeetings(meetingUrl);
        const issues = result.summaries || [];
        const name = issues?.[0]?.headline || "Meeting Summary";

        const updatedMeeting = await Meetings.findOneAndUpdate(
            { MeetingsId },
            {
                issues,
                status: "Completed",
                name,
            },
            { new: true }
        )

        if (!updatedMeeting) {
            return new Response("Meeting not found", { status: 404 });
        }

        return new Response(JSON.stringify({
            message: "Issues created for the meeting",
            meeting: updatedMeeting
        }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }
}