import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, cookieOptions } from "../lib/util.js";

export const login = async (req, res) => {
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"Email and password are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({message:"Invalid credentials"});
        }

        generateToken(user._id,user.role,res);
        res.status(200).json({
             _id: user._id,
             role: user.role,
             name: user.name,
        });
    }
    catch(error){
        console.error("Login error:", error);
        res.status(500).json({message:"Server error"});
    }
};



export const logout = async (req, res) => {
    res.clearCookie("token", "", { ...cookieOptions, maxAge: 0 });
    res.status(200).json({message:"Logged out successfully"});
};



//export const updateprofile = async (req, res) => {};