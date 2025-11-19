import connectDB from "@/app/db/connectDb";
import User from "@/app/models/User";
import { auth } from "@clerk/nextjs/server"

const JoinHandler =async ({ params }) => {
    const { projectId } =await params;
    const {userId}=await auth();
    if(!userId){
        return redirect("/sign-in")
    }
    await connectDB();
    const dbUser=await User.findOne({userId});
    
}

export default JoinHandler
