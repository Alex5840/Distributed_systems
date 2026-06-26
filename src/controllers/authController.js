import bcrypt from "bcryptjs";
import pool from "../../db.js";
export const registerController = async(req, res)=>{
    try {
    const {username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    await pool.query(
        "INSERT INTO USERS (username, email, password) VALUES ($1, $2, $3)",
     [username, email, hashedPassword]
    );
 return res.status(201).json({
    success: true,
    message: "User registered successfully"
 })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
    
}