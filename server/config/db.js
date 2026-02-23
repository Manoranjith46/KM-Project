import mongoose from 'mongoose';



const connectDB = async () => {
  try {
    // We strictly use process.env to keep the URL secret
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected SuccessFully : ${conn.connection.host}`);
  } catch (error) {
    console.log("❌ DB Connection Error:", error);
    process.exit(1); // 1 means exit with failure
  }
};

export default connectDB;