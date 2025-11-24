import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/app/db/connectDb";
import User from "@/app/models/User";
import Payment from "@/app/models/Payment";

// Handle GET request (when Razorpay redirects back)
export const GET = async (req) => {
    try {
        await connectDB();

        const searchParams = req.nextUrl.searchParams;
        
        const razorpay_payment_id = searchParams.get('razorpay_payment_id');
        const razorpay_order_id = searchParams.get('razorpay_order_id');
        const razorpay_signature = searchParams.get('razorpay_signature');

        // If no payment params, might be coming from Clerk redirect
        if (!razorpay_order_id) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?error=missing-params`);
        }

        return await verifyAndProcessPayment({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        });

    } catch (err) {
        console.error("Payment Verification Error (GET):", err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?error=server`);
    }
};

// Handle POST request (if Razorpay sends POST)
export const POST = async (req) => {
    try {
        await connectDB();

        let form = await req.formData();
        let body = Object.fromEntries(form);

        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = body;

        return await verifyAndProcessPayment({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        });

    } catch (err) {
        console.error("Payment Verification Error (POST):", err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?error=server`);
    }
};

// Shared verification logic
async function verifyAndProcessPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) {
    // 1) Find Payment
    const payment = await Payment.findOne({ oid: razorpay_order_id });

    if (!payment) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?error=order-not-found`);
    }

    // Prevent double-processing
    if (payment.done) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?success=true&already=processed`);
    }

    // 2) Verify Razorpay Signature
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature !== razorpay_signature) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?error=signature-failed`);
    }

    // 3) Mark Payment as Done
    payment.done = true;
    payment.status = "completed";
    await payment.save();

    // 4) Add Credits
    const user = await User.findOne({ userId: payment.userId });

    if (!user) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?error=user-not-found`);
    }

    user.credits += payment.credits;
    await user.save();

    // SUCCESS REDIRECT
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/billings?success=true`);
}