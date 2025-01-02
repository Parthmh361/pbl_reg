import mongoose, { Schema, Document } from 'mongoose';

// Topic1 Schema
interface ITopic1 extends Document {
  name: string;
  mentorId: Schema.Types.ObjectId;
  isTaken: boolean;
}

const Topic1Schema: Schema<ITopic1> = new Schema({
  name: { type: String, required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor12', required: true },
  isTaken: { type: Boolean, default: false },
});

const Topic1 = mongoose.models.Topic1 || mongoose.model<ITopic1>('Topic1', Topic1Schema);
export default Topic1;
