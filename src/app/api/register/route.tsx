import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/model/User';
import Topic from '@/app/model/Topic';
import Mentor from '@/app/model/Mentor';
import mongoose from 'mongoose';
interface TeamMember {
  prn: string;
}

export async function POST(req: Request) {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    if (!prn || !email || !teamLeader || !mentorOption1 || !topicOption1) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: 'All mandatory fields (PRN, Email, Team Leader, Mentor 1, Topic 1) must be filled.' },
        { status: 400 }
      );
    }

    const prnsToCheck: string[] = [prn, ...teamMembers.map((member: TeamMember) => member.prn)];

    // Check if PRNs already exist
    const existingUsers = await User.find({
      prn: { $in: prnsToCheck }
    });

    if (existingUsers.length > 0) {
      const takenPrns = existingUsers.map(user => user.prn);
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { 
          message: 'Some PRNs are already registered. Please check and use unique PRNs.',
          details: `Taken PRNs: ${takenPrns.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Check topic availability
    const topics = await Topic.find({
      _id: { $in: [topicOption1, topicOption2].filter(Boolean) }
    }).select('name isTaken');

    const takenTopics = topics.filter(topic => topic.isTaken);
    if (takenTopics.length > 0) {
      const takenTopicNames = takenTopics.map(topic => topic.name);
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { 
          message: 'Selected topics are no longer available. Please choose different topics.',
          details: `Taken Topics: ${takenTopicNames.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Fetch mentor names based on mentorOption1 and mentorOption2
    const mentors = await Mentor.find({
      _id: { $in: [mentorOption1, mentorOption2].filter(Boolean) }
    }).select('name');

    if (mentors.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: 'Selected mentors are not available. Please refresh and try again.' },
        { status: 400 }
      );
    }

    const mentorNames = mentors.map((mentor) => mentor.name);

    // Create new user
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

    await newUser.save({ session });

    // Mark topics as taken
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

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: 'Team details successfully saved! You can now proceed.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      { 
        message: 'An unexpected error occurred during registration. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
