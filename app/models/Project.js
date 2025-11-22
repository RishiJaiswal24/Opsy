import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ProjectSchema = new Schema({
    projectId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    projectUrl: { type: String, required: true },

    processingStatus: {
        type: String,
        enum: ["not_started", "processing", "completed", "failed"],
        default: "not_started"
    },

    fileCount: { type: Number, default: 0 },
    
    members: [
        {
            userId: { type: String, required: true },
            firstName: String,
            lastName: String,
            profilepic: String,
            email: String,
            joinedAt: { type: Date, default: Date.now },
        }
    ],
}, { timestamps: true });
export default mongoose.models.Project || model("Project", ProjectSchema);