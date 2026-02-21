import mongoose from "mongoose";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Task from "../models/Task.js";
import Nurse from "../models/Nurse.js";

export const getPatientsForDoctor = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        const doctor = await Doctor.findOne({ userId });
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

        const patients = await Patient.find({ doctorId: doctor._id }).populate({
            path: "doctorId",
            populate: { path: "userId", select: "name email" },
        });

        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        const { id } = req.params;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        const doctor = await Doctor.findOne({ userId });
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

        const patient = await Patient.findOne({ _id: id, doctorId: doctor._id }).populate({
            path: "doctorId",
            populate: { path: "userId", select: "name email" },
        });
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDoctorAppointments = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        const doctor = await Doctor.findOne({ userId });
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Patients store appointment date at `appointmentTime.date` — query that field
        const appointments = await Patient.find({
            doctorId: doctor._id,
            "appointmentTime.date": { $gte: startOfDay, $lte: endOfDay },
        }).populate({
            path: "doctorId",
            populate: { path: "userId", select: "name email" },
        });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTaskByDoctor = async (req, res) => {
    try{
         const userId = req.user && req.user._id;
         if (!userId) return res.status(400).json({ message: "User ID not found" });

            const {patientId,nurseId,taskType,description,timingType,scheduledAt,dueDate} = req.body;
            if(!patientId || !nurseId || !taskType || !description || !timingType){
                return res.status(400).json({message:"patientId, nurseId, taskType, description and timingType are required"});
            }

            const allowedTaskTypes = ["MEDICATION","TEST","VITALS"];
            const allowedTiming = ["SCHEDULED","FLEXIBLE"];
            if(!allowedTaskTypes.includes(taskType)){
                return res.status(400).json({message:`taskType must be one of ${allowedTaskTypes.join(",")}`});
            }
            if(!allowedTiming.includes(timingType)){
                return res.status(400).json({message:`timingType must be one of ${allowedTiming.join(",")}`});
            }
            if(timingType === "SCHEDULED" && !scheduledAt){
                return res.status(400).json({message:"scheduledAt is required for SCHEDULED tasks"});
            }

            // ensure doctor matches authenticated user
            const doctor = await Doctor.findOne({ userId });
            if(!doctor) return res.status(404).json({message:"Doctor profile not found"});

            // validate patient belongs to doctor
            const patient = await Patient.findById(patientId);
            if(!patient) return res.status(404).json({message:"Patient not found"});
            if(String(patient.doctorId) !== String(doctor._id)) return res.status(403).json({message:"Patient does not belong to this doctor"});

            // validate nurse belongs to same doctor
            const nurse = await Nurse.findById(nurseId);
            if(!nurse) return res.status(404).json({message:"Nurse not found"});
            if(String(nurse.doctorId) !== String(doctor._id)) return res.status(403).json({message:"Nurse does not belong to this doctor"});

            const scheduledDate = timingType === "SCHEDULED" ? new Date(scheduledAt) : undefined;
            const dueDateObj = timingType === "FLEXIBLE" && dueDate ? new Date(dueDate) : undefined;
            if(scheduledDate && isNaN(scheduledDate.getTime())) return res.status(400).json({message:"Invalid scheduledAt date"});
            if(dueDateObj && isNaN(dueDateObj.getTime())) return res.status(400).json({message:"Invalid dueDate"});

            const newTask = new Task({
                patientId,
                doctorId: doctor._id,
                nurseId,
                taskType,
                description,
                timingType,
                scheduledAt: scheduledDate,
                dueDate: dueDateObj,
            });

         const savedTask = await newTask.save();
         res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getDoctorTasks = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        const doctor = await Doctor.findOne({ userId });
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

        const tasks = await Task.find({ doctorId: doctor._id })
            .populate({ path: "patientId", select: "name age diagnosis" })
            .populate({
                path: "nurseId",
                populate: { path: "userId", select: "name email" },
            })
            .sort({ scheduledAt: 1, createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDoctorPatientTasks = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        const { patientId } = req.params;
        if (!userId) 
            return res.status(400).json({ message: "User ID not found" });

        const doctor = await Doctor.findOne({ userId });
        if (!doctor) 
            return res.status(404).json({ message: "Doctor profile not found" });  

        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({ message: "Invalid patientId" });
        }

        const patient = await Patient.findOne({ _id: patientId, doctorId: doctor._id });
        if (!patient) 
            return res.status(404).json({ message: "Patient not found or does not belong to this doctor" });

        const tasks = await Task.find({ patientId, doctorId: doctor._id })
            .populate({ path: "patientId", select: "name age diagnosis" })
            .populate({ path: "nurseId", populate: { path: "userId", select: "name email" } })
            .sort({ scheduledAt: 1, createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPatientPrescription = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        const { patientId } = req.params;
        if (!userId) return res.status(400).json({ message: "User ID not found" });

        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({ message: "Invalid patientId" });
        }

        const doctor = await Doctor.findOne({ userId }).populate("userId", "name email");
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

        const patient = await Patient.findOne({ _id: patientId, doctorId: doctor._id });
        if (!patient) return res.status(404).json({ message: "Patient not found or does not belong to this doctor" });

        const tasks = await Task.find({ patientId, doctorId: doctor._id }).sort({ scheduledAt: 1, createdAt: -1 });

        const tasksFormatted = tasks.map(t => {
            const time = t.scheduledAt ? t.scheduledAt : (t.dueDate ? t.dueDate : t.createdAt);
            return {
                time: time ? time.toISOString() : null,
                description: t.description || "",
            };
        });

        const payload = {
            doctor: {
                name: doctor.userId?.name || null,
                email: doctor.userId?.email || null,
            },
            patient: {
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                diagnosis: patient.diagnosis,
            },
            generatedAt: new Date().toISOString(),
            tasks: tasksFormatted,
        };

        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
