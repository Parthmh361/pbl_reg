import mongoose, { Schema, Document } from 'mongoose';

interface IMentor12 extends Document {
  name: string;
  assignedTopics: string[];
}

const Mentor12Schema: Schema<IMentor12> = new Schema({
  name: { type: String, required: true },
  assignedTopics: { type: [String], required: true },
});

// Post-save hook for automatic topic creation
Mentor12Schema.post('save', async function (this: IMentor12) {
  try {
    const Topic1 = mongoose.model('Topic1');
    const Topic2 = mongoose.model('Topic2');

    for (const topicName of this.assignedTopics) {
      // Create topics in Topic1 if not already existing
      const existingTopic1 = await Topic1.findOne({ name: topicName, mentorId: this._id });
      if (!existingTopic1) {
        await Topic1.create({ name: topicName, mentorId: this._id, isTaken: false });
      }

      // Create topics in Topic2 if not already existing
      const existingTopic2 = await Topic2.findOne({ name: topicName, mentorId: this._id });
      if (!existingTopic2) {
        await Topic2.create({ name: topicName, mentorId: this._id, isTaken: false });
      }
    }
  } catch (error) {
    console.error('Error creating topics:', error);
  }
});

const Mentor12 = mongoose.models.Mentor12 || mongoose.model<IMentor12>('Mentor12', Mentor12Schema);
export default Mentor12;
