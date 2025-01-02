import { NextResponse } from 'next/server';
import Topic1 from '../../model/Topic1'; // Adjust the import path based on your project structure
import Topic2 from '../../model/Topic2'; // Adjust the import path based on your project structure
import dbConnect from '../../lib/dbConnect'; // Ensure you have a database connection utility

// GET /api/topicId?name=<topicName>&type=1|2
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const type = searchParams.get('type'); // Determines whether to use Topic1 or Topic2

  if (!name) {
    return NextResponse.json({ message: 'Topic name is required' }, { status: 400 });
  }

  if (!type || (type !== '1' && type !== '2')) {
    return NextResponse.json({ message: 'Type parameter is required and must be 1 or 2' }, { status: 400 });
  }

  try {
    await dbConnect(); // Ensure the database is connected

    // Determine which model to query based on the type
    const TopicModel = type === '1' ? Topic1 : Topic2;

    const topic = await TopicModel.findOne({ name });

    if (!topic) {
      return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic, { status: 200 });
  } catch (error) {
    console.error('Error fetching topic ID:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
