import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const QuestionSchema = new Schema({
    questionId: { type: String, required: true },
    userId: { type: String, required: true },
    projectId: { type: String, required: true },

    question: { type: String, required: true },
    answers: { type: String, required: true },
    fileRefrenced: { type: Array, required: true },

}, { timestamps: true });
export default mongoose.models.Question || model("Question", QuestionSchema);