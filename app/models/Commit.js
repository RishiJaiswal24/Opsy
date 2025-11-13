import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CommitSchema = new Schema({
    commitId: { type: String, required: true },

    projectId: { type: String, required: true },

    commitMessage: { type: String, required: true },
    commitHash: { type: String, required: true },
    commitAuthorName: { type: String, default: "Unknown Author" },
    commitAuthorAvatar: { type: String, default: "https://avatars.githubusercontent.com/u/0?v=4" },
    commitDate: { type: Date, default: Date.now },
    summary: { type: String},
}, { timestamps: true });
export default mongoose.models.Commit || model("Commit", CommitSchema);