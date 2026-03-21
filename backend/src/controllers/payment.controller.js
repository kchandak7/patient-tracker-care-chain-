import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Patient from "../models/Patient.js";

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// POST /api/payment/create-order  (admin only)
export const createOrder = async (req, res) => {
    try {
        const { patientId, amount, description } = req.body;

        if (!patientId || !amount) {
            return res.status(400).json({ message: "patientId and amount are required" });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        const patient = await Patient.findById(patientId).populate("doctorId");
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const razorpay = getRazorpayInstance();
        const amountInPaise = Math.round(amount * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                patientId: patientId.toString(),
                description: description || "",
            },
        });

        const payment = new Payment({
            patientId,
            doctorId: patient.doctorId._id,
            orderId: order.id,
            amount: amountInPaise,
            currency: "INR",
            status: "created",
            description: description || "",
        });
        await payment.save();

        return res.status(201).json({
            orderId: order.id,
            amount: amountInPaise,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            paymentDbId: payment._id,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Server error while creating order" });
    }
};

// POST /api/payment/verify  (admin only)
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment verification fields" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        const payment = await Payment.findOne({ orderId: razorpay_order_id });
        if (!payment) {
            return res.status(404).json({ message: "Order not found in database" });
        }

        if (isValid) {
            payment.paymentId = razorpay_payment_id;
            payment.status = "paid";
        } else {
            payment.status = "failed";
        }
        await payment.save();

        return res.status(200).json({
            success: isValid,
            payment,
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Server error while verifying payment" });
    }
};

// GET /api/payment/patient/:patientId  (admin + doctor)
export const getPaymentsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const payments = await Payment.find({ patientId })
            .populate({ path: "patientId", select: "name age gender" })
            .populate({ path: "doctorId", populate: { path: "userId", select: "name" } })
            .sort({ createdAt: -1 });

        return res.status(200).json(payments);
    } catch (error) {
        console.error("Error fetching payments by patient:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/payment/all  (admin only)
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({ path: "patientId", select: "name age gender" })
            .populate({ path: "doctorId", populate: { path: "userId", select: "name" } })
            .sort({ createdAt: -1 });

        return res.status(200).json(payments);
    } catch (error) {
        console.error("Error fetching all payments:", error);
        res.status(500).json({ message: "Server error" });
    }
};
