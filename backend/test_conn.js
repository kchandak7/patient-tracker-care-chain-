import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connect = async () => {
    try {
        console.log("Attempting to connect to:", process.env.MONGO_URI.substring(0, 30) + "...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        console.log("Connected to MongoDB successfully!");
        process.exit(0);
    } catch (error) {
        console.error("MongoDB Connection Error Details:");
        console.error(error.message);
        if (error.reason) {
            console.error("Reason:", JSON.stringify(error.reason, null, 2));
        }
        process.exit(1);
    }
};

connect();
