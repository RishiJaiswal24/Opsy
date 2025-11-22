import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    userId: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    profilepic: { type: String },
    credits: { type: Number, default: 50 },
}, { timestamps: true });
export default mongoose.models.User || model("User", UserSchema);