import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://23051382_db_user:gyBWHU61EiCRBia1@adproj1.1ahfvkt.mongodb.net/?retryWrites=true&w=majority";

const testSimple = async () => {
    try {
        console.log("Testing simple connection...");
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Simple connection SUCCESS!");
        process.exit(0);
    } catch (err) {
        console.error("Simple connection FAILED:", err.message);
        process.exit(1);
    }
};

testSimple();
