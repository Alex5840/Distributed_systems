import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js"
import { validateUser } from "./src/middleware/authMiddleware.js";
import { registerController } from "./src/controllers/authController.js";
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
function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            "secret_key"
        );

        req.user = decoded;

        
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
    next();
}
app.post("/auth/login", async (req, res) => {

    const { email, password } = req.body;

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )
   const user = result.rows[0];
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        {
            email: user.email,
            username: user.username
        },
        "secret_key"
    );

    return res.status(200).json({
        success: true,
        token
    });
});
app.get("/auth/profile", auth, (req, res) => {

    return res.status(200).json({
        success: true,
        user: req.user
    });
    

});
app.get("/test-db", async (req, res) => {

    const result =
        await pool.query("SELECT NOW()");

    res.json(result.rows);

});
app.listen(5000, ()=>{
    console.log("Server is running on port 5000");
})
