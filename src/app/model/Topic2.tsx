import mongoose, { Schema, Document } from 'mongoose';

// Topic2 Schema
interface ITopic2 extends Document {
  name: string;
  mentorId: Schema.Types.ObjectId;
  isTaken: boolean;
}

const Topic2Schema: Schema<ITopic2> = new Schema({
  name: { type: String, required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor12', required: true },
  isTaken: { type: Boolean, default: false },
});

const Topic2 = mongoose.models.Topic2 || mongoose.model<ITopic2>('Topic2', Topic2Schema);
export default Topic2;
