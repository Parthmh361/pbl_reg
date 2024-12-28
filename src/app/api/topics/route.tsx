import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Topic from '../../model/Topic';

/**
 * @desc Get Topics by Mentor ID that are not taken (GET)
 * @route GET /api/topics?mentorId=ID
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const mentorId = req.nextUrl.searchParams.get('mentorId'); // Retrieve mentorId from query parameters

    if (!mentorId) {
      return NextResponse.json({ error: 'mentorId query parameter is required' }, { status: 400 });
    }

    // Fetch topics that are not taken
    const topics = await Topic.find({ mentorId, isTaken: false });  // Adjusted to only fetch non-taken topics
    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

/**
 * @desc Create a New Topic (POST)
 * @route POST /api/topics
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, mentorId } = await req.json();

    if (!name || !mentorId) {
      return NextResponse.json({ error: 'Invalid input. Provide name and mentorId.' }, { status: 400 });
    }

    // Ensure the topic is not already created with the same name and mentorId
    const existingTopic = await Topic.findOne({ name, mentorId });
    if (existingTopic) {
      return NextResponse.json({ error: 'Topic already exists for this mentor.' }, { status: 400 });
    }

    // Create a new topic with `isTaken` set to false
    const newTopic = await Topic.create({ name, mentorId, isTaken: false });
    return NextResponse.json({ message: 'Topic created successfully', topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
