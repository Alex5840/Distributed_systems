import pool from "../config/db.js";


export const profileController = async(req, res)=>{
    const userId = req.user.id;
  
const result = await pool.query(
    "SELECT id, username, email FROM users WHERE id = $1",
    [userId]
);
    
    return res.status(200).json({
        success: true,
        result,
        message: "user profile fetched successfully",
        
    })
}
