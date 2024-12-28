import mongoose, { Schema } from 'mongoose';

const LoginUserSchema: Schema = new Schema({
  prn: { type: String, required: true, unique: true },
  email: { type: String, required: true },
});

// Specify the collection name explicitly
const LoginUser = mongoose.models.LoginUser || mongoose.model('LoginUser', LoginUserSchema, 'loginusers');

export default LoginUser;
