import mongoose from 'mongoose';

const dbConnect = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://parthchoudhari3612:<db_password>@cluster0.ccucqrl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  });
};

export default dbConnect;
