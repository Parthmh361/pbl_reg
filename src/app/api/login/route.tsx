import { NextResponse } from 'next/server';
import LoginUser from '../../model/LoginUser'; // Adjust the path to your model

// POST route for login
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { prn, email } = await req.json();

    // Check if prn and email are provided
    if (!prn || !email) {
      return NextResponse.json({ error: 'PRN and email are required.' }, { status: 400 });
    }

    // Find user in the database
    const user = await LoginUser.findOne({ prn, email });

    // If user doesn't exist
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
