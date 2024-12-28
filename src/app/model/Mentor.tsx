import mongoose, { Schema, Document } from 'mongoose';

// Mentor Schema and Post-Save Hook
interface IMentor extends Document {
  name: string;
  assignedTopics: string[];
}

const MentorSchema: Schema<IMentor> = new Schema({
  name: { type: String, required: true },
  assignedTopics: { type: [String], required: true },
});

MentorSchema.post('save', async function (this: IMentor) {
  try {
    for (let topicName of this.assignedTopics) {
      await mongoose.model('Topic').create({
        name: topicName,
        mentorId: this._id, // Reference to the mentor
        isTaken: false,
      });
    }
  } catch (error) {
    console.error('Error creating topics:', error);
  }
});

const Mentor = mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', MentorSchema);
export default Mentor;
