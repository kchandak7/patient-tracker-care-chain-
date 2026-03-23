import express from "express";
import {
    createOrder,
    verifyPayment,
    getPaymentsByPatient,
    getAllPayments,
} from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Admin only
router.post("/create-order", adminOnly, createOrder);
router.post("/verify", adminOnly, verifyPayment);
router.get("/all", adminOnly, getAllPayments);

// Admin + Doctor (protectRoute is sufficient — both roles authenticated)
router.get("/patient/:patientId", getPaymentsByPatient);

export default router;
