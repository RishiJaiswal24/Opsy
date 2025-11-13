import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ProjectSchema = new Schema({
    projectId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    projectUrl: { type: String, required: true }, 
}, { timestamps: true });
export default mongoose.models.Project || model("Project", ProjectSchema);