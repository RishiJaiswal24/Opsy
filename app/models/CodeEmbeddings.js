import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CodeEmbeddingsSchema = new Schema({
    sourceCode: { type: String, required: true },
    fileName: { type: String, required: true },
    summary: { type: String, required: true },
    projectId: { type: String, required: true },
    summaryEmbedding: { type: [Number], required: true },
}, { timestamps: true });
export default mongoose.models.CodeEmbeddings || model("CodeEmbeddings", CodeEmbeddingsSchema);