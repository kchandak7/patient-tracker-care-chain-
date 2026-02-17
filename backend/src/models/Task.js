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
    },
    {
        timestamps: true,
    });

    const Task = mongoose.model("Task", taskSchema);
export default Task;