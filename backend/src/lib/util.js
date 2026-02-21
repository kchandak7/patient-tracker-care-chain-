import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
};

export const generateToken = (userId,role,res) => {
    const {JWT_SECRET} = process.env;
    if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign({userId,role},JWT_SECRET,{expiresIn:"7d"});
    res.cookie("token", token, cookieOptions);
    return token;
}