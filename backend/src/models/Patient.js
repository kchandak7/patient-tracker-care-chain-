import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
