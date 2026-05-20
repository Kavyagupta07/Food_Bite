import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bite', {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.MOCK_DB = 'false';
  } catch (error) {
    console.warn('\n======================================================');
    console.warn(`WARNING: Failed to connect to MongoDB: ${error.message}`);
    console.warn('The server will run in MEMORY-MOCK MODE for testing.');
    console.warn('No data will be saved permanently, but the app will work!');
    console.warn('======================================================\n');
    process.env.MOCK_DB = 'true';
  }
};

export default connectDB;

