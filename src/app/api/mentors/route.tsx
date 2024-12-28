import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Mentor from '@/app/model/Mentor';
import Topic from '@/app/model/Topic';  // Import Topic model to create topics

// Fetch all mentors (GET route remains unchanged)
export async function GET() {
  try {
    await dbConnect();
    const mentors = await Mentor.find({});
    return NextResponse.json(mentors, { status: 200 });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ message: 'Error fetching mentors', error }, { status: 500 });
  }
}

// Create multiple mentors and automatically create topics (POST route)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Extract data from the request body
    const mentorsData = await req.json();

    // Validate input: Check if the body is an array of mentors
    if (!Array.isArray(mentorsData)) {
      return NextResponse.json({ error: 'Invalid input. Provide an array of mentors.' }, { status: 400 });
    }

    const createdMentors = [];

    // Loop through each mentor in the input array and create them along with topics
    for (const mentorData of mentorsData) {
      const { name, assignedTopics } = mentorData;

      // Validate each mentor's data
      if (!name || !Array.isArray(assignedTopics)) {
        return NextResponse.json({ error: 'Invalid mentor data. Each mentor must have a name and an array of assignedTopics.' }, { status: 400 });
      }

      // Create new mentor
      const newMentor = await Mentor.create({ name, assignedTopics });

      // Create topics linked to the newly created mentor
      const topicPromises = assignedTopics.map((topicName: string) =>
        Topic.create({
          name: topicName,
          mentorId: newMentor._id,  // Associate the topic with the mentor
          isTaken: false,           // Set isTaken to false initially
        })
      );

      // Wait for all topics to be created
      await Promise.all(topicPromises);

      createdMentors.push(newMentor);
    }

    return NextResponse.json({ message: 'Mentors created successfully and topics added', mentors: createdMentors }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentors and topics:', error);
    return NextResponse.json({ error: 'Failed to create mentors and topics' }, { status: 500 });
  }
}
