import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import { createDefaultAdmin } from "./lib/createDefaultAdmin.js";



const app = express();
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/doctor",doctorRoutes);


app.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
  await createDefaultAdmin();
});
