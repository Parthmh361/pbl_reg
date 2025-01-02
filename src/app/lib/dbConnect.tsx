import mongoose from 'mongoose';

const dbConnect = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI || "", {
    serverSelectionTimeoutMS: 30000,  // 30 seconds timeout
    socketTimeoutMS: 45000,  // Timeout for idle connections
  });
};

export default dbConnect;
