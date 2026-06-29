import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import NotFoundError from "../errors/NotFoundError.js";

dotenv.config();
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
export const loginController = async(req, res)=>{
    const { email, password } = req.body;

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )
   const user = result.rows[0];

   if(!user){
    throw new NotFoundError(
    "User not found"
);
   }
   
   const isMatch = await bcrypt.compare(
        password,
        user.password
    );
    if(!isMatch){
        return res.status(401).json({
            success: false,
            message: "Invalid Credentials"
        })
    }
    const token = jwt.sign(
        {  
            id: user.id,
            email: user.email,

        },
        process.env.JWT_SECRET,
    )
    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        token: token
    })

}