import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        const admin = await User.findOne({ email: "admin@hospital.com" });
        if (admin) {
            console.log("Admin user found:", admin.email);
        } else {
            console.log("Admin user NOT found!");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAdmin();
