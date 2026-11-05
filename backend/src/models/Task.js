import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",     
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,   
            ref: "Doctor",
            required: true,
        },  
        nurseId: {
            type: mongoose.Schema.Types.ObjectId,   
            ref: "Nurse",
            required: true,
        },
        taskType: {
            type: String,
            enum: ["MEDICATION", "TEST", "VITALS"],
            required: true,
        },
        description: {  
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
            default: "PENDING",
        },
        resultValue: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
        },
        timingType: {
            type: String,
            enum: ["SCHEDULED", "FLEXIBLE"],
            required: true,
            default: "FLEXIBLE",
        },

    // Used only when timingType === "SCHEDULED"
        scheduledAt: {
            type: Date,
        },

    // Used only when timingType === "FLEXIBLE"
        dueDate: {
            type: Date,
        },

    // When nurse actually completes the task
        completedAt: {
             type: Date,
        },

    // ─── Structured Vitals (for VITALS tasks) ───────────────────────────
        vitals: {
            respiratoryRate: Number,
            spO2:            Number,
            systolicBP:      Number,
            diastolicBP:     Number,
            heartRate:       Number,
            temperature:     Number,
            consciousness:   { type: String, enum: ["A", "C", "V", "P", "U"], default: "A" },
            onSupplementalO2: { type: Boolean, default: false },
        },
        news2Score: { type: Number },
        news2Risk:  { type: String, enum: ["LOW", "LOW-MEDIUM", "MEDIUM", "HIGH"] },
    },
    {
     timestamps: true,
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;