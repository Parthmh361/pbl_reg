import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  prn: string;
  email: string;
  teamLeader: string;
  teamMembers: Array<{
    name: string;
    prn: string;
    semester: string;
    section: string;
    contact: string;
    email: string;
  }>;
  mentorOption1: string | null;
  mentorOption2: string | null;
  topicOption1: string | null;
  topicOption2: string | null;
}

const UserSchema: Schema<IUser> = new Schema({
  prn: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  teamLeader: { type: String, required: true },
  teamMembers: [
    {
      name: { type: String, default: null },
      prn: { type: String, default: null },
      semester: { type: String, default: null },
      section: { type: String, default: null },
      contact: { type: String, default: null },
      email: { type: String, default: null },
    },
  ],
  mentorOption1: { type: String, default: null },
  mentorOption2: { type: String, default: null },
  topicOption1: { type: String, default: null },
  topicOption2: { type: String, default: null },
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'users');

export default User;
