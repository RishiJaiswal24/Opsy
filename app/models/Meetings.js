import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MeetingsSchema = new Schema({
    MeetingsId: { type: String, required: true },
    projectId: { type: String, required: true },
    userId: { type: String, required: true },
    meetingUrl: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, default: "Processing" },
    issues: {type: Array}

}, { timestamps: true });
export default mongoose.models.Meetings || model("Meetings", MeetingsSchema);