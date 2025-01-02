import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Mentor12 from '@/app/model/Mentor12';

// GET Route to fetch all mentors
export async function GET() {
  try {
    await dbConnect();
    const mentors = await Mentor12.find({});
    return NextResponse.json(mentors, { status: 200 });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ message: 'Error fetching mentors', error }, { status: 500 });
  }
}

// POST Route to create mentors
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const mentorsData = await req.json();

    if (!Array.isArray(mentorsData)) {
      return NextResponse.json({ error: 'Invalid input. Provide an array of mentors.' }, { status: 400 });
    }

    const createdMentors = [];

    for (const mentorData of mentorsData) {
      const { name, assignedTopics } = mentorData;

      if (!name || !Array.isArray(assignedTopics)) {
        return NextResponse.json({ error: 'Invalid mentor data. Each mentor must have a name and an array of assignedTopics.' }, { status: 400 });
      }

      const existingMentor = await Mentor12.findOne({ name });
      if (existingMentor) {
        return NextResponse.json({ error: `Mentor with name "${name}" already exists.` }, { status: 400 });
      }

      const newMentor = await Mentor12.create({ name, assignedTopics });
      createdMentors.push(newMentor);
    }

    return NextResponse.json({ message: 'Mentors created successfully', mentors: createdMentors }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentors:', error);
    return NextResponse.json({ error: 'Failed to create mentors' }, { status: 500 });
  }
}
