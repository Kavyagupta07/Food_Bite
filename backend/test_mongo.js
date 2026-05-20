import mongoose from 'mongoose';

const uri = "mongodb+srv://g3512138_db_user:nVp4iXpPPn2vx9rU@bite.t6fajrr.mongodb.net/bite?retryWrites=true&w=majority&appName=bite";

console.log("Attempting to connect to MongoDB Atlas...");

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ SUCCESS! Successfully connected to live MongoDB Atlas cluster.");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ ERROR: Failed to connect to MongoDB Atlas.");
    console.error(err.message);
    process.exit(1);
  });
