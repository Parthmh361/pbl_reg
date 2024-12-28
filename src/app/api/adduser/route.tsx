import { NextResponse } from 'next/server';
import LoginUser from '../../model/LoginUser'; // Adjust the import path based on your folder structure
import dbConnect from '@/app/lib/dbConnect';

// Establish MongoDB connection
dbConnect();
export async function POST(req: Request) {
  try {
    // Connect to the database
    dbConnect();

    // Parse incoming request data
    const { prn, email } = await req.json();

    // Validate the input data
    if (!prn || !email) {
      return NextResponse.json({ message: 'PRN and email are required' }, { status: 400 });
    }

    // Check if user with the same PRN already exists
    const existingUser = await LoginUser.findOne({ prn });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Create a new user
    const newUser = new LoginUser({ prn, email });

    // Save the new user to the database
    await newUser.save();

    return NextResponse.json({ message: 'User added successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error adding user' }, { status: 500 });
  }
}
