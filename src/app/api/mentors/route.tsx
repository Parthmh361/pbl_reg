import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Mentor from '@/app/model/Mentor';
import Topic from '@/app/model/Topic';

/**
 * @desc Fetch all mentors (GET route)
 * @route GET /api/mentors
 */
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

/**
 * @desc Create multiple mentors and automatically create topics (POST route)
 * @route POST /api/mentors
 */
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

      // Check if the mentor already exists to avoid duplicates
      const existingMentor = await Mentor.findOne({ name });
      if (existingMentor) {
        return NextResponse.json({ error: `Mentor with name "${name}" already exists.` }, { status: 400 });
      }

      // Create new mentor
      const newMentor = await Mentor.create({ name, assignedTopics });

      // Create topics linked to the newly created mentor
      const topicPromises = assignedTopics.map(async (topicName: string) => {
        // Check if the topic already exists to avoid duplicates
        const existingTopic = await Topic.findOne({ name: topicName, mentorId: newMentor._id });
        if (!existingTopic) {
          await Topic.create({
            name: topicName,
            mentorId: newMentor._id,  // Associate the topic with the mentor
            isTaken: false,           // Set isTaken to false initially
          });
        }
      });

      // Wait for all topics to be created (if they don't already exist)
      await Promise.all(topicPromises);

      createdMentors.push(newMentor);
    }

    return NextResponse.json({ message: 'Mentors created successfully and topics added', mentors: createdMentors }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentors and topics:', error);
    return NextResponse.json({ error: 'Failed to create mentors and topics' }, { status: 500 });
  }
}
