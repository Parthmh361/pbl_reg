import mongoose, { Schema, Document } from 'mongoose';

// Topic Schema
interface ITopic extends Document {
  name: string;
  mentorId: Schema.Types.ObjectId;
  isTaken: boolean;
}

const TopicSchema: Schema<ITopic> = new Schema({
  name: { type: String, required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
  isTaken: { type: Boolean, default: false },
});

const Topic = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
export default Topic;
