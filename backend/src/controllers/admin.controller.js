import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Nurse from "../models/Nurse.js";
import Patient from "../models/Patient.js";
import Task from "../models/Task.js";
import bcrypt from "bcryptjs";
import { generateCredentials } from "../lib/generator.js";


export const createDoctor = async (req,res) => {
    try{
        const {name,specialization,department} = req.body;

        if(!name || !specialization || !department){
            return res.status(400).json({message:"All fields are required"});
        }

        const {email,password} = generateCredentials({name,role:"DOCTOR",department});

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"Doctor with this email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword =  await bcrypt.hash(password,salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: "DOCTOR",
        });

        const savedUser = await user.save();

        const doctor = new Doctor({
            userId: savedUser._id,
            specialization,
            department,
        });
        
        const savedDoctor = await doctor.save();
        return res.status(201).json({
          user: savedUser,
          doctor: savedDoctor,
          credentials: { email, password },
        });
    }
    catch(error){
        console.error("Error creating doctor:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const deleteDoctor = async (req,res) => {
    try{
         const {id} = req.params;
         const { reassignTo } = req.body; // Doctor._id to reassign nurses/patients to

         const doctor = await Doctor.findOne({userId:id});

         if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
         }

         // Check if there are nurses or patients that need reassignment
         const nurseCount = await Nurse.countDocuments({ doctorId: doctor._id });
         const patientCount = await Patient.countDocuments({ doctorId: doctor._id });

         if ((nurseCount > 0 || patientCount > 0) && !reassignTo) {
            return res.status(400).json({
              message: "This doctor has assigned nurses/patients. Provide a reassignTo doctor ID.",
              nurseCount,
              patientCount,
              requiresReassign: true,
            });
         }

         // Validate reassign target if provided
         if (reassignTo) {
            const targetDoctor = await Doctor.findById(reassignTo);
            if (!targetDoctor) {
              return res.status(404).json({ message: "Reassignment target doctor not found" });
            }
            if (targetDoctor._id.toString() === doctor._id.toString()) {
              return res.status(400).json({ message: "Cannot reassign to the same doctor being deleted" });
            }

            // Reassign all nurses and patients
            await Nurse.updateMany({ doctorId: doctor._id }, { doctorId: targetDoctor._id });
            await Patient.updateMany({ doctorId: doctor._id }, { doctorId: targetDoctor._id });
            await Task.updateMany({ doctorId: doctor._id }, { doctorId: targetDoctor._id });
         }

         await User.findByIdAndDelete(id);
         await Doctor.findOneAndDelete({userId:id});

         res.status(200).json({
           message: "Doctor deleted successfully",
           reassigned: reassignTo ? { nurseCount, patientCount } : null,
         });
    }
    catch(error){
        console.error("Error deleting doctor:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const createNurse = async (req,res) => {
    try{
         const {name,doctorId} = req.body;

         if(!name || !doctorId){
            return res.status(400).json({message:"Name and doctorId are required"});
         }

         const doctor = await Doctor.findById(doctorId);
         if (!doctor) {
            return res.status(404).json({ message: "Assigned doctor not found" });
            }
         
         const {email,password} = generateCredentials({name,role:"NURSE"});

         const existingUser = await User.findOne({email});
         if(existingUser){
            return res.status(400).json({message:"Nurse with this email already exists"});
         }

         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password,salt);

         const user = new User({
            name,
            email,
            password: hashedPassword,
            role: "NURSE",
         });

         const savedUser = await user.save();

         const nurse = new Nurse({
            userId: savedUser._id,
            doctorId: doctor._id,
         });
         const savedNurse = await nurse.save();
         res.status(201).json({
           user: savedUser,
           nurse: savedNurse,
           credentials: { email, password },
         });
    }
    catch(error){
        console.error("Error creating nurse:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const deleteNurse = async (req,res) => {
    try{
         const {id} = req.params;

         const nurse = await Nurse.findOne({userId:id});
         if(!nurse){
            return res.status(404).json({message:"Nurse not found"});
         }

         await User.findByIdAndDelete(id);

         await Nurse.findOneAndDelete({userId:id});

         res.status(200).json({message:"Nurse deleted successfully"});
    }
    catch(error){
        console.error("Error deleting nurse:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const getAllDoctors = async (req,res) => {
    try{
        const doctors = await Doctor.find().populate("userId","name email");
        res.status(200).json(doctors);
    }
    catch(error){
        console.error("Error fetching doctors:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const getAllNurses = async (req,res) => {
    try{
        const nurses = await Nurse.find()
        .populate("userId", "name email")
        .populate({
         path: "doctorId",
         populate: {
         path: "userId",
         select: "name email"
    }
  });

        res.status(200).json(nurses);
    }
    catch(error){
        console.error("Error fetching nurses:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, doctorId, appointmentTime } = req.body;

    if (!name || !age || !gender || !doctorId || !appointmentTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Assigned doctor not found" });
    }

    if (age <= 0) {
      return res.status(400).json({ message: "Age must be a positive number" });
    }

    const normalizedGender = gender.toUpperCase();
    const allowedGenders = ["MALE", "FEMALE", "OTHER"];
    if (!allowedGenders.includes(normalizedGender)) {
      return res.status(400).json({
        message: "Gender must be MALE, FEMALE or OTHER",
      });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(appointmentTime.time)) {
      return res.status(400).json({ message: "Invalid time format. Expected HH:MM" });
    }

    // Parse as local datetime (avoid forcing UTC which can shift the provided time)
    const appointmentDateTime = new Date(`${appointmentTime.date}T${appointmentTime.time}:00`);
    if (isNaN(appointmentDateTime.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date or time" });
    }

    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ message: "Appointment time must be in the future" });
    }

    const patient = new Patient({
      name,
      age,
      gender: normalizedGender, 
      doctorId,
      appointmentTime: {
        date: appointmentTime.date,
        time: appointmentTime.time,
      },
    });

    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePatient = async (req,res) => {
    try{
        const {id} = req.params;
        if(!id){
            return res.status(400).json({message:"Patient ID is required"});
        }

        const patient = await Patient.findById(id);
        if(!patient){
            return res.status(404).json({message:"Patient not found"});
        }

        // Delete all tasks associated with this patient
        await Task.deleteMany({ patientId: id });

        await Patient.findByIdAndDelete(id);
        res.status(200).json({message:"Patient deleted successfully"});
    }
    catch(error){
        console.error("Error deleting patient:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Server error" });
  }
};
