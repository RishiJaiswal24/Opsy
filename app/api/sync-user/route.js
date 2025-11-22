// sync-user/route.js
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/app/db/connectDb';
import User from '@/app/models/User';

export async function GET() {
  const { userId } = await auth();
  if (!userId) throw new Error('User not found');

  try {
    const client=await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return new Response('No email', { status: 404 });

    await connectDB();
    let person = await User.findOne({ email });

    if (person) {
      person.firstName = user.firstName;
      person.lastName = user.lastName;
      person.profilepic = user.imageUrl;
    } else {
      person = new User({
        firstName: user.firstName,
        lastName: user.lastName,
        email,
        userId,
        profilepic: user.imageUrl,
      });
    }

    await person.save();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
