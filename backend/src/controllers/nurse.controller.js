import mongoose from "mongoose";
import Nurse from "../models/Nurse.js";
import Patient from "../models/Patient.js";
import Task from "../models/Task.js";
import Doctor from "../models/Doctor.js";

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
        if (!userId) 
            return res.status(400).json({ message: "User ID not found" });

        const nurse = await Nurse.findOne({ userId });
        if (!nurse) 
            return res.status(404).json({ message: "Nurse not found" });

        const { taskId } = req.params;
        if (!taskId) 
            return res.status(400).json({ message: "taskId is required in URL" });
        
        if (!mongoose.isValidObjectId(taskId)) 
            return res.status(400).json({ message: "Invalid taskId" });

        const task = await Task.findById(taskId);
        if (!task) 
            return res.status(404).json({ message: "Task not found" });

        // Ownership check: task must be assigned to this nurse
        if (!task.nurseId || String(task.nurseId) !== String(nurse._id)) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        // Acceptable updates only
        const { status, resultValue, image, escalation } = req.body;

        // Handle image upload if provided (expects base64 or data URI)
        let imageUrl;
        if (image) {
            try {
                const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
                const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
                if (cloudName && uploadPreset && typeof fetch !== 'undefined') {
                    const form = new FormData();
                    form.append('file', image);
                    form.append('upload_preset', uploadPreset);

                    const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                        method: 'POST',
                        body: form,
                    });
                    if (!resp.ok) {
                        const text = await resp.text();
                        console.error('Cloudinary upload failed', text);
                    } else {
                        const data = await resp.json();
                        imageUrl = data.secure_url;
                    }
                } else {
                    console.warn('Cloudinary not configured or fetch/FormData unavailable; skipping image upload');
                }
            } catch (err) {
                console.error('Image upload error:', err);
            }
        }

        // Apply allowed updates
        const allowed = {};
        if (typeof status === 'string') allowed.status = status;
        if (typeof resultValue === 'string') allowed.resultValue = resultValue;
        if (imageUrl) allowed.image = imageUrl;

        // If status becomes COMPLETED set completedAt
        if (allowed.status === 'COMPLETED' && !task.completedAt) {
            allowed.completedAt = new Date();
        }

        // Apply the updates to the task document
        Object.keys(allowed).forEach(k => { task[k] = allowed[k]; });

        // Save
        const saved = await task.save();

        const populated = await Task.findById(saved._id)
            .populate({ path: 'patientId', select: 'name' })
            .populate({ path: 'nurseId', populate: { path: 'userId', select: 'name email' } });

        res.status(200).json(populated);
    } catch (error) {
        console.error('Error in updateNurseTask:', error);
        res.status(500).json({ message: 'Internal server error' });
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