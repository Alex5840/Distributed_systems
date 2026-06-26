import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js"
const app = express();
app.use(express.json());
app.get("/", (req,res)=>{
    res.json({message: "Hi Alex"});
})

// register routes

const users = [];
app.post("/auth/register", async(req, res)=>{
     
   
    const {username,email, password} = req.body;
    
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    const existingUser = result.rows[0];
    if(existingUser){
        return res.status(409).json({success: false, message: "User already exists"});
    }
    if(!username){
        return res.status(400).json({message: "Username is required"});
    }
    if(!email){
        return res.status(400).json({message: "Email is required"});
    }
    if(!email.includes('@')){
        return res.status(400).json({message:"Invalid Email"});
    }
    if(!password){
        return res.status(400).json({message: "Password is required"});
    }
    if(password.length<8){
        return res.status(400).json({success: false, message: "Password length should be atleast 8 characters"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
        [username, email, hashedPassword]
    )
    return res.status(201).json({success: true, message: "User registered successfully"});
    
    
    
})
 
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
