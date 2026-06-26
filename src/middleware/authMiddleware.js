import pool from "../../db.js";

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