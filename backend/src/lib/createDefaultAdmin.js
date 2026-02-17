import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createDefaultAdmin = async () => {
  try {
    // 1. Check if admin already exists
    const existingAdmin = await User.findOne({ role: "ADMIN" });
    if (existingAdmin) {
      console.log("✅ Admin already exists");
      return;
    }

    // 2. Read admin credentials from ENV
    const {
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin ENV variables are missing");
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 4. Create admin user
    const admin = new User({
      name: ADMIN_NAME || "System Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    });

    await admin.save();

    console.log("🚀 Default ADMIN created");
    console.log("📧 Email:", ADMIN_EMAIL);
    console.log("🔑 Password:", ADMIN_PASSWORD);
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
};
