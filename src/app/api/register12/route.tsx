import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/model/User';
import Topic1 from '@/app/model/Topic1';
import Topic2 from '@/app/model/Topic2';
import mongoose from 'mongoose';
import Mentor12 from '@/app/model/Mentor12';

interface TeamMember {
  email: string;
  name: string;
  prn: string;
}

// ✅ **Email Sending Function**
async function sendEmail(
  recipients: string[], teamDetails: string, mentorDetails: string, mentorOption1: string
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pblsit123@gmail.com',
      pass: 'dsbi jmie rhmx umhk', // Use environment variables in production
    },
  });

  const mailOptions = {
    from: 'innovation@sitnagpur.siu.edu.in',
    to: recipients.join(', '),
    subject: 'PBL Registration Successful',
    text: `
      Dear Students,

      You have successfully registered for PBL under ${mentorOption1}.

      Team Details:
      ${teamDetails}

      Mentor and Topic Preferences:
      ${mentorDetails}

      Kindly contact your PBL Mentor immediately and start working on Project-Based Learning.

      Happy Learning.

      Regards,
      Dr. Sudhanshu Maurya
      PBL Coordinator
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
}

// ✅ **POST Handler for Registration**
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
  
      // Log the teamLeader and teamMembers for debugging
      console.log(teamLeader);
      console.log(teamMembers);
  
      // Validate mandatory fields
      if (!prn || !email || !teamLeader || !teamMembers || !mentorOption1 || !topicOption1) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: 'All mandatory fields (PRN, Email, Team Leader, Mentor 1, Topic 1) must be filled.' },
          { status: 400 }
        );
      }
  
      // Validate that all team members have the required fields
      for (const member of teamMembers) {
        if (!member.name || !member.prn || !member.semester || !member.section || !member.contact || !member.email) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { message: `All team members must have the following fields: name, prn, semester, section, contact, email.` },
            { status: 400 }
          );
        }
      }
  
      const prnsToCheck: string[] = [prn, ...teamMembers.map((member: TeamMember) => member.prn)];
  
      // ✅ **Check if PRNs already exist**
      const existingUsers = await User.find({
        prn: { $in: prnsToCheck }
      }).session(session);
  
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
  
      // ✅ **Check topic availability**
      const topic1 = await Topic1.findOne({ _id: topicOption1 }).session(session);
      const topic2 = topicOption2
        ? await Topic2.findOne({ _id: topicOption2 }).session(session)
        : null;
  
      const unavailableTopics = [];
      if (topic1?.isTaken) unavailableTopics.push(topic1.name);
      if (topic2?.isTaken) unavailableTopics.push(topic2.name);
  
      if (unavailableTopics.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { 
            message: 'Selected topics are no longer available. Please choose different topics.',
            details: `Unavailable Topics: ${unavailableTopics.join(', ')}` 
          },
          { status: 400 }
        );
      }
  
      // ✅ **Fetch mentor names**
      const mentors = await Mentor12.find({
        _id: { $in: [mentorOption1, mentorOption2].filter(Boolean) }
      }).session(session).select('name');
  
      const orderedMentors = [mentorOption1, mentorOption2].map(optionId =>
        mentors.find(mentor => mentor._id.toString() === optionId)
      );
  
      const mentorNames = orderedMentors.map((mentor) => mentor?.name || 'N/A');
  
      if (mentorNames.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: 'Selected mentors are not available. Please refresh and try again.' },
          { status: 400 }
        );
      }
  
      // ✅ **Create New User**
      const userDetails = {
        prn,
        email,
        teamLeader: {
          name: teamLeader.name,
          prn: teamLeader.prn,
          semester: teamLeader.semester,
          section: teamLeader.section,
          contact: teamLeader.contact,
          email: teamLeader.email,
        },
        teamMembers,
        mentorOption1: mentorNames[0] || null,
        mentorOption2: mentorNames[1] || null,
        topicOption1: topic1?.name || null,
        topicOption2: topic2?.name || null,
      };
  
      const newUser = new User(userDetails);
      await newUser.save({ session });
  
      // ✅ **Mark topics as taken**
      if (topic1) {
        await Topic1.findOneAndUpdate(
          { _id: topicOption1 }, 
          { isTaken: true },
          { session }
        );
      }
      if (topic2) {
        await Topic2.findOneAndUpdate(
          { _id: topicOption2 }, 
          { isTaken: true },
          { session }
        );
      }
  
      await session.commitTransaction();
      session.endSession();
  
      // ✅ **Prepare Email Details**
      const teamDetails = [
        `Team Leader: ${teamLeader.name} (PRN: ${teamLeader.prn})`,
        ...teamMembers.map((member: TeamMember, index: number) => 
          `Member ${index + 1}: ${member.name} (${member.prn})`
        ),
      ].join('\n');
  
      const mentorDetails = `Faculty Preference 1: ${mentorNames[0]} - Topic: ${topic1?.name || 'N/A'}
      Faculty Preference 2: ${mentorNames[1] || 'N/A'} - Topic: ${topic2?.name || 'N/A'}`;
  
      // ✅ **Send Email**
      const allEmails = [email, ...teamMembers.map((member: TeamMember) => member.email)];
      await sendEmail(allEmails, teamDetails, mentorDetails, mentorNames[0]);
  
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
  