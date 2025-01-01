import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/model/User';
import Topic from '@/app/model/Topic';
import Mentor from '@/app/model/Mentor';
import mongoose from 'mongoose';

interface TeamMember {
  prn: string;
  // Add other member properties if necessary
}

export async function POST(req: Request) {
  const session = await mongoose.startSession(); // Start a session for transaction
  session.startTransaction(); // Start the transaction

  try {
    await dbConnect();

    const body = await req.json();
    const { 
      prn, 
      email, 
      teamLeader, 
      teamMembers, 
      mentorOption1, 
      mentorOption2, 
      topicOption1, 
      topicOption2 
    } = body;

    const prnsToCheck: string[] = [prn, ...teamMembers.map((member: TeamMember) => member.prn)];

    // Check if any of the PRNs already exist
    const existingUsers = await User.find({
      prn: { $in: prnsToCheck }
    }).session(session);

    if (existingUsers.length > 0) {
      const takenPrns = existingUsers.map(user => user.prn);
      await session.abortTransaction(); // Abort transaction if validation fails
      session.endSession();
      return NextResponse.json(
        { message: `The following PRNs are already in use: ${takenPrns.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch topics and check availability
    const topics = await Topic.find({
      _id: { $in: [topicOption1, topicOption2].filter(Boolean) }
    }).session(session).select('name isTaken');

    const takenTopics = topics.filter(topic => topic.isTaken);
    if (takenTopics.length > 0) {
      const takenTopicNames = takenTopics.map(topic => topic.name);
      await session.abortTransaction(); // Abort transaction if validation fails
      session.endSession();
      return NextResponse.json(
        { message: `The following topics are already taken: ${takenTopicNames.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch mentor names
    const mentors = await Mentor.find({
      _id: { $in: [mentorOption1, mentorOption2].filter(Boolean) }
    }).session(session).select('name');

    const mentorNames = mentors.map((mentor) => mentor.name);

    // Create user first
    const newUser = new User({
      prn,
      email,
      teamLeader,
      teamMembers,
      mentorOption1: mentorNames[0] || null,
      mentorOption2: mentorNames[1] || null,
      topicOption1: topics[0]?.name || null,
      topicOption2: topics[1]?.name || null,
    });

    await newUser.save({ session }); // Save user within the session

    // Mark topics as taken **after** user creation
    if (topicOption1) {
      await Topic.findOneAndUpdate(
        { _id: topicOption1 }, 
        { isTaken: true },
        { session }
      );
    }
    if (topicOption2) {
      await Topic.findOneAndUpdate(
        { _id: topicOption2 }, 
        { isTaken: true },
        { session }
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    await session.abortTransaction(); // Rollback changes in case of failure
    session.endSession();
    return NextResponse.json({ message: 'Error creating user', error }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
