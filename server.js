import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./src/config/db.js";
import dotenv from "dotenv";
dotenv.config();
import { auth, validateUser } from "./src/middleware/authMiddleware.js";
import { loginController, registerController } from "./src/controllers/authController.js";
import { profileController } from "./src/controllers/profileContoller.js";
import { errorMiddlware } from "./src/middleware/errorMiddleware.js";
const app = express();
app.use(express.json());
app.get("/", (req,res)=>{
    res.json({message: "Hi Alex"});
})

// register routes

const users = [];
app.post("/auth/register",validateUser, registerController);
 
app.get("/auth/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        
        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message

        })
        
    }
})

app.post("/auth/login", loginController);
app.get("/auth/profile",auth, profileController);
app.get("/test-db", async (req, res) => {

    const result =
        await pool.query("SELECT NOW()");

    res.json(result.rows);

});
app.use(errorMiddlware);
app.listen(process.env.PORT, ()=>{
    console.log(`Server running on ${process.env.PORT}`);
})
