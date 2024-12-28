import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/model/User';
import Topic from '@/app/model/Topic';
import Mentor from '@/app/model/Mentor';

interface TeamMember {
  prn: string;
  // Add other member properties if necessary
}

export async function POST(req: Request) {
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

    // Ensure teamMembers is typed correctly
    const prnsToCheck: string[] = [prn, ...teamMembers.map((member: TeamMember) => member.prn)];

    // Check if any of the PRNs already exist in the User database
    const existingUsers = await User.find({
      prn: { $in: prnsToCheck }
    });

    if (existingUsers.length > 0) {
      // Find out which PRNs are already taken and return an error message
      const takenPrns = existingUsers.map(user => user.prn);
      return NextResponse.json(
        { message: `The following PRNs are already in use: ${takenPrns.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch mentor names based on mentorOption1 and mentorOption2
    const mentors = await Mentor.find({
      _id: { $in: [mentorOption1, mentorOption2].filter(Boolean) }
    }).select('name');

    const mentorNames = mentors.map((mentor) => mentor.name);

    // Fetch topics based on topicOption1 and topicOption2 to check availability
    const topics = await Topic.find({
      _id: { $in: [topicOption1, topicOption2].filter(Boolean) }
    }).select('name isTaken');

    const topicNames = topics.map((topic) => {
      if (topic.isTaken) {
        return { name: topic.name, isTaken: true };
      }
      return { name: topic.name, isTaken: false };
    });

    // Check if any topic is already taken (isTaken === true)
    const takenTopics = topicNames.filter((topic) => topic.isTaken);

    if (takenTopics.length > 0) {
      const takenTopicNames = takenTopics.map((topic) => topic.name);
      return NextResponse.json(
        { message: `The following topics are already taken: ${takenTopicNames.join(', ')}` },
        { status: 400 }
      );
    }

    // Update topics to mark them as taken if they are available
    if (topicOption1 && topicNames[0].isTaken === false) {
      await Topic.findOneAndUpdate(
        { _id: topicOption1 }, 
        { isTaken: true }
      );
    }

    if (topicOption2 && topicNames[1].isTaken === false) {
      await Topic.findOneAndUpdate(
        { _id: topicOption2 }, 
        { isTaken: true }
      );
    }

    // Create a new user entry with mentor names and topic names
    const newUser = new User({
      prn,
      email,
      teamLeader,
      teamMembers,
      mentorOption1: mentorNames[0] || null,
      mentorOption2: mentorNames[1] || null,
      topicOption1: topicNames[0].name || null,
      topicOption2: topicNames[1].name || null,
    });

    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user', error }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
