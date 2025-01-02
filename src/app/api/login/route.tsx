import { NextResponse } from 'next/server';
import LoginUser from '../../model/LoginUser'; // Adjust the path to your LoginUser model
import User from '../../model/User'; // Import your User model

// POST route for login
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { prn, email } = await req.json();

    // Check if prn and email are provided
    if (!prn || !email) {
      return NextResponse.json({ error: 'PRN and email are required.' }, { status: 400 });
    }

    // Check if the user exists in the User model (teamLeader or teamMember)
    const existingUser = await User.findOne({
      $or: [
        { prn, email }, // Check if prn and email match any user in the system
        { 'teamMembers.prn': prn, 'teamMembers.email': email } // Check if prn and email match any team member
      ]
    }).exec();

    // If user is found, do not allow login
    if (existingUser) {
      return NextResponse.json({ error: 'User is already part of a team. Cannot log in.' }, { status: 400 });
    }

    // Find user in the LoginUser model
    const user = await LoginUser.findOne({ prn, email }).exec();

    // If user doesn't exist in LoginUser model
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // If user exists, return a success message with user details (excluding sensitive data)
    return NextResponse.json({ success: true, user: { prn: user.prn, email: user.email } }, { status: 200 });

  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json({ error: 'Server error, please try again later.' }, { status: 500 });
  }
}
