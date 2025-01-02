import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Topic1 from '../../model/Topic1';
import Topic2 from '../../model/Topic2';

/**
 * @desc Get Topics by Mentor ID for Topic1 and Topic2 (GET)
 * @route GET /api/topics?mentorId=ID&type=1|2
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const mentorId = req.nextUrl.searchParams.get('mentorId'); // Retrieve mentorId from query parameters
    const type = req.nextUrl.searchParams.get('type'); // Retrieve type (1 for Topic1, 2 for Topic2)

    if (!mentorId) {
      return NextResponse.json({ error: 'mentorId query parameter is required' }, { status: 400 });
    }

    if (!type || (type !== '1' && type !== '2')) {
      return NextResponse.json({ error: 'type query parameter is required and must be 1 or 2' }, { status: 400 });
    }

    // Determine the appropriate model
    const TopicModel = type === '1' ? Topic1 : Topic2;

    // Fetch topics that are not taken
    const topics = await TopicModel.find({ mentorId, isTaken: false });

    // Filter out duplicate topics based on the 'name' field
    const uniqueTopics = topics.filter((value, index, self) =>
      index === self.findIndex((t) => t.name === value.name)
    );

    return NextResponse.json(uniqueTopics, { status: 200 });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

/**
 * @desc Create a New Topic for Topic1 or Topic2 (POST)
 * @route POST /api/topics
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, mentorId, type } = await req.json();

    if (!name || !mentorId || !type || (type !== 1 && type !== 2)) {
      return NextResponse.json({ error: 'Invalid input. Provide name, mentorId, and type (1 or 2).' }, { status: 400 });
    }

    // Determine the appropriate model
    const TopicModel = type === 1 ? Topic1 : Topic2;

    // Ensure the topic is not already created with the same name and mentorId
    const existingTopic = await TopicModel.findOne({ name, mentorId });
    if (existingTopic) {
      return NextResponse.json({ error: 'Topic already exists for this mentor.' }, { status: 400 });
    }

    // Create a new topic with `isTaken` set to false
    const newTopic = await TopicModel.create({ name, mentorId, isTaken: false });
    return NextResponse.json({ message: 'Topic created successfully', topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
