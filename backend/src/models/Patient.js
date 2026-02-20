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

    appointmentTime: {
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    }
  }
  },
  {
    timestamps: true,
  }
);

// Virtual: appointmentAt — derived Date combining appointment date and time
patientSchema.virtual("appointmentAt").get(function () {
  try {
    const appt = this.appointmentTime;
    if (!appt || !appt.date || !appt.time) return null;

    // Stored `date` is a Date object (midnight). Use its YYYY-MM-DD portion.
    const dateObj = appt.date instanceof Date ? appt.date : new Date(appt.date);
    if (isNaN(dateObj.getTime())) return null;
    const datePart = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

    const timePart = String(appt.time).trim();
    const combined = new Date(`${datePart}T${timePart}:00`);
    return isNaN(combined.getTime()) ? null : combined;
  } catch (err) {
    return null;
  }
});

// Include virtuals when converting documents to JSON / objects
patientSchema.set("toJSON", { virtuals: true });
patientSchema.set("toObject", { virtuals: true });

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
