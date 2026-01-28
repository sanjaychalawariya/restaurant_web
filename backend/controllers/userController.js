import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import validator from "validator";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Input validation helper
const validateUserInput = (email, password, username = null) => {
    const errors = [];

    if (!email || !password) {
        errors.push("Email and password are required");
    }

    if (email && !validator.isEmail(email)) {
        errors.push("Please enter a valid email");
    }

    if (password && !validator.isStrongPassword(password)) {
        errors.push("Password must be at least 8 characters long and contain uppercase, lowercase, number, and symbol");
    }

    if (username && (!username.trim() || username.length < 3)) {
        errors.push("Username must be at least 3 characters long");
    }

    return errors;
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        const validationErrors = validateUserInput(email, password);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: validationErrors[0] 
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Generate token
        const token = createToken(user._id);

        // Remove password from response
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            cartData: user.cartData
        };

        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Validate input
        const validationErrors = validateUserInput(email, password, username);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: validationErrors[0] 
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            const field = existingUser.email === email ? "email" : "username";
            return res.status(400).json({ 
                success: false, 
                message: `User with this ${field} already exists` 
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = new userModel({
            username: username.trim(),
            email: email.toLowerCase(),
            password: hashedPassword
        });
        
        const user = await newUser.save();
        
        // Generate token
        const token = createToken(user._id);
        
        // Remove password from response
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            cartData: user.cartData
        };

        res.status(201).json({
            success: true,
            token,
            user: userResponse
        });
    } catch (error) {
        console.error("Registration error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "User with this email or username already exists" 
            });
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: messages[0] 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};
console.log('JWT_SECRET:', process.env.JWT_SECRET);

export { loginUser, registerUser };