import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import nurseRoutes from "./routes/nurse.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { createDefaultAdmin } from "./lib/createDefaultAdmin.js";
import cors from "cors";



const app = express();
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/nurse", nurseRoutes);
app.use("/api/payment", paymentRoutes);

// Health check endpoint for Railway
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}`);
  await connectDB();
  await createDefaultAdmin();
});
