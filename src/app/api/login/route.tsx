// import { NextResponse } from 'next/server';
// import dbConnect from '@/app/lib/dbConnect';
// import User from '../../model/User'; // Adjust the path based on your project structure

// // Ensure database connection
// dbConnect();

// // Named export for the POST method
// export async function POST(req: Request) {
//   try {
//     const body = await req.json(); // Parse JSON body
//     const { prn, email } = body;

//     if (!prn || !email) {
//       return NextResponse.json({ message: 'PRN and email are required' }, { status: 400 });
//     }

//     // Check if the user exists in the database
//     const user = await User.findOne({ prn, email });

//     if (user) {
//       return NextResponse.json(
//         { message: 'Login successful', user: { prn: user.prn, email: user.email } },
//         { status: 200 }
//       );
//     } else {
//       return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
//     }
//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }
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
