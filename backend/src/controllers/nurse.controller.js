import mongoose from "mongoose";
import Nurse from "../models/Nurse.js";
import Patient from "../models/Patient.js";
import Task from "../models/Task.js";
import Doctor from "../models/Doctor.js";
import cloudinary from "../lib/cloudinary.js";

const ALLOWED_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export const getAllNurseTasks = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        const nurse = await Nurse.findOne({ userId });
        if (!nurse) return res.status(404).json({ message: "Nurse not found" });

        const tasks = await Task.find({ nurseId: nurse._id })
            .populate({ path: "patientId", select: "name age diagnosis" })
            .populate({ path: "doctorId", populate: { path: "userId", select: "name email" } })
            .populate({ path: "nurseId", populate: { path: "userId", select: "name email" } })
            .sort({ scheduledAt: 1, createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching all nurse tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getNurseProfile = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        const nurse = await Nurse.findOne({ userId })
            .populate("userId", "name email")
            .populate({ path: "doctorId", populate: { path: "userId", select: "name email" } });
        if (!nurse) return res.status(404).json({ message: "Nurse not found" });

        res.status(200).json(nurse);
    } catch (error) {
        console.error("Error fetching nurse profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getPatientsForNurse = async (req, res) => {
    try{
         const userId = req.user && req.user._id;
         if(!userId) 
            return res.status(400).json({message:"User ID not found"});

         const nurse = await Nurse.findOne({ userId });
         if(!nurse) 
            return res.status(404).json({message:"Nurse not found"});

          // Find tasks assigned to this nurse, then collect unique patientIds
          const tasks = await Task.find({ nurseId: nurse._id }).select("patientId scheduledAt dueDate createdAt description");
          const patientIdSet = new Set();
          tasks.forEach(t => { if (t.patientId) patientIdSet.add(String(t.patientId)); });

          const patientIds = Array.from(patientIdSet);
          if (patientIds.length === 0) return res.status(200).json([]);

          const patients = await Patient.find({ _id: { $in: patientIds } })
             .populate({ path: "doctorId", populate: { path: "userId", select: "name email" } });

          res.status(200).json(patients);
        
        } catch (error) {
        console.error("Error fetching patients for nurse:", error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const updateNurseTask = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(400).json({ message: "User ID not found" });

    const nurse = await Nurse.findOne({ userId });
    if (!nurse) return res.status(404).json({ message: "Nurse not found" });

    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ownership check
    if (String(task.nurseId) !== String(nurse._id)) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const { status, resultValue, image } = req.body;

    const allowed = {};

    // ✅ STATUS VALIDATION
    if (typeof status === "string") {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
        });
      }
      allowed.status = status;
    }

    // ✅ RESULT VALUE
    if (typeof resultValue === "string") {
      allowed.resultValue = resultValue.trim();
    }

    // ✅ IMAGE UPLOAD (Node-safe)
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "nurse-tasks",
        resource_type: "image",
      });
      allowed.image = uploadResult.secure_url;
    }

    // ✅ SYSTEM-CONTROLLED COMPLETION TIME
    if (allowed.status === "COMPLETED" && !task.completedAt) {
      allowed.completedAt = new Date();
    }

    // Apply updates
    Object.keys(allowed).forEach((key) => {
      task[key] = allowed[key];
    });

    await task.save();

    const populated = await Task.findById(task._id)
      .populate({ path: "patientId", select: "name" })
      .populate({
        path: "nurseId",
        populate: { path: "userId", select: "name email" },
      });

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error updating nurse task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const togglePatientFlag = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        const nurse = await Nurse.findOne({ userId });
        if (!nurse) return res.status(404).json({ message: "Nurse not found" });

        const { patientId } = req.params;
        if (!mongoose.isValidObjectId(patientId))
            return res.status(400).json({ message: "Invalid patientId" });

        // Ensure the patient belongs to the same doctor as the nurse
        const patient = await Patient.findOne({ _id: patientId, doctorId: nurse.doctorId });
        if (!patient)
            return res.status(404).json({ message: "Patient not found or not assigned to this nurse's doctor" });

        patient.flagged = !patient.flagged;
        await patient.save();

        res.status(200).json({ flagged: patient.flagged, patientId: patient._id });
    } catch (error) {
        console.error("Error toggling patient flag:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getNursePatientTask = async (req,res) => {
    try{
        const userId = req.user && req.user._id;
        if(!userId) 
            return res.status(400).json({message:"User ID not found"});

        const nurse = await Nurse.findOne({ userId });
        if(!nurse) 
            return res.status(404).json({message:"Nurse not found"});

        const patientId = req.params.patientId;
        if(!patientId) 
            return res.status(400).json({message:"Patient ID not provided"});

        if(!mongoose.isValidObjectId(patientId)) 
            return res.status(400).json({ message: "Invalid patientId" });

        // Ensure the patient belongs to the same doctor as the nurse
        const patient = await Patient.findOne({ _id: patientId, doctorId: nurse.doctorId });
        if(!patient) 
            return res.status(404).json({ message: "Patient not found or not assigned to this nurse's doctor" });

        const tasks = await Task.find({ patientId, nurseId: nurse._id })
            .populate({ path: 'patientId', select: 'name' })
            .populate({ path: 'nurseId', populate: { path: 'userId', select: 'name email' } })
            .sort({ scheduledAt: 1, createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks for nurse and patient:", error);
        res.status(500).json({message:"Internal server error"});
    }
}