import mongoose from "mongoose";

const nurseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, 
            unique: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
    },
    {
        timestamps: true,
    });

    const Nurse = mongoose.model("Nurse", nurseSchema);
export default Nurse;