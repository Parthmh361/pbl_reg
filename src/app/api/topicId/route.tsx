import { NextResponse } from 'next/server';
import Topic from '../../model/Topic'; // Adjust the import path based on your project structure
import dbConnect from '../../lib/dbConnect'; // Ensure you have a database connection utility

// GET /api/topicId?name=<topicName>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ message: 'Topic name is required' }, { status: 400 });
  }

  try {
    await dbConnect(); // Ensure the database is connected
    const topic = await Topic.findOne({ name });

    if (!topic) {
      return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic, { status: 200 });
  } catch (error) {
    console.error('Error fetching topic ID:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
