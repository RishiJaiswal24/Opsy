import { NavigationMenuViewport } from "@radix-ui/react-navigation-menu";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PaymentSchema = new Schema({
    paymentId: {type: String,required: true},
    userId: { type: String, required: true },
    oid: { type: String, required: true },
    amount: { type: Number, required: true },
    credits:{ type: Number, required: true },
    done: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.Payment || model("Payment", PaymentSchema);