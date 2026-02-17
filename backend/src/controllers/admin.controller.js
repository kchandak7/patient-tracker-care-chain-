import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Nurse from "../models/Nurse.js";
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
        return res.status(201).json({user:savedUser,doctor:savedDoctor});
    }
    catch(error){
        console.error("Error creating doctor:", error);
        res.status(500).json({message:"Server error"});
    }
};


export const deleteDoctor = async (req,res) => {
    try{
         const {id} = req.params;

         const doctor = await Doctor.findOne({userId:id});

         if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
         }
         await User.findByIdAndDelete(id);

         await Doctor.findOneAndDelete({userId:id});

         res.status(200).json({message:"Doctor deleted successfully"});
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
         res.status(201).json({user:savedUser,nurse:savedNurse});
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