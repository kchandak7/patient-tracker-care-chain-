import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import nurseRoutes from "./routes/nurse.route.js";
import { createDefaultAdmin } from "./lib/createDefaultAdmin.js";
import cors from "cors";



const app = express();
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,              
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/doctor",doctorRoutes);
app.use("/api/nurse",nurseRoutes);


app.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
  await createDefaultAdmin();
});
