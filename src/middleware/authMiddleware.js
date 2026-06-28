import pool from "../config/db.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
dotenv.config();
export const validateUser = async(req, res, next) => {
    const {username, email, password} = req.body;
     const result = await pool.query(
        "SELECT * FROM users WHERE email = $1", [email]
    )
    if(!username){
        return res.status(400).json({
            success: false,
            message: "Username is required"
        })
    }
    if(!email){
        return res.status(400).json({
            success: false,
            message: "Email is required"
        })
    }
    if(!email.includes('@')){
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        })
    }
    if(!password || password.length < 8 || password.length > 20){
        return res.status(400).json({
            success: false,
            message: "Password must be between 8 and 20 characters"
        })}
    const existingUser = result.rows[0];
    if(existingUser){
        return res.status(409).json({
           success: false,
           message: "User already exists"
        })
    }
    next();
}
export const auth = (req, res,next)=>{

    const authHeader = req.headers.authorization;
    if(!authHeader){
        return  res.status(401).json({
            success: false,
            message: "No token provided"
        })
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.user = decoded;

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
    next();

}