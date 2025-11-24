import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/app/db/connectDb";
import User from "@/app/models/User";
import Payment from "@/app/models/Payment";
import { auth } from "@clerk/nextjs/server";

export const POST = async (req) => {
    try {
        // Verify user is authenticated
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await req.json();
        
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return NextResponse.json(
                { success: false, error: "Missing payment parameters" },
                { status: 400 }
            );
        }

        // 1) Find Payment
        const payment = await Payment.findOne({ oid: razorpay_order_id });

        if (!payment) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        // Verify this payment belongs to the current user
        if (payment.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized access to this order" },
                { status: 403 }
            );
        }

        // Prevent double-processing
        if (payment.done) {
            return NextResponse.json(
                { success: true, message: "Payment already processed" },
                { status: 200 }
            );
        }

        // 2) Verify Razorpay Signature
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 400 }
            );
        }

        // 3) Mark Payment as Done
        payment.done = true;
        payment.status = "completed";
        payment.razorpay_payment_id = razorpay_payment_id;
        await payment.save();

        // 4) Add Credits
        const user = await User.findOne({ userId: payment.userId });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        user.credits += payment.credits;
        await user.save();

        // SUCCESS
        return NextResponse.json(
            { 
                success: true, 
                message: "Payment verified and credits added",
                credits: user.credits 
            },
            { status: 200 }
        );

    } catch (err) {
        console.error("Payment Verification Error:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
};