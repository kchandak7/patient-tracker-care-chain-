import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const protectRoute = async (req,res,next) => {
    try{
         const token = req.cookies.token;
         if(!token){
            return res.status(401).json({message:"Unauthorized access. Please log in."});
         }

         const decoded = jwt.verify(token,process.env.JWT_SECRET);
         if(!decoded){
            return res.status(401).json({message:"Unauthorized access. Invalid Token."});
         }

         const user = await User.findById(decoded.userId).select("-password"); 
         if (!user){
            return res.status(404).json({message:"User not found."});
         }

         req.user = user;
         next();
    }   catch(error){
         console.error("Error in protectRoute middleware:", error);
         res.status(500).json({message:"Internal Server Error"});
    }       
}