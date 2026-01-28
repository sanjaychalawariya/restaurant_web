import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Main authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        console.log('Auth middleware called');
        
        // Get token from header
        const authHeader = req.header('Authorization');
        console.log('Authorization header:', authHeader);
        
        if (!authHeader) {
            // Allow the request to continue without user info (for guest orders)
            req.user = null;
            console.log('No auth header - proceeding as guest');
            return next();
        }

        // Extract token from Bearer format
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        console.log('Extracted token:', token ? 'Present' : 'Missing');

        if (!token || token === 'null' || token === 'undefined') {
            req.user = null;
            console.log('Invalid token format - proceeding as guest');
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        // Find user by ID
        const user = await userModel.findById(decoded.id).select('-password');
        
        if (!user) {
            req.user = null;
            console.log('User not found - proceeding as guest');
            return next();
        }

        // Add user to request object
        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin || false
        };

        console.log('User authenticated:', req.user.username);
        next();
    } catch (error) {
        // If token is invalid, continue as guest
        console.log('Auth middleware error:', error.message);
        req.user = null;
        next();
    }
};

// Require authentication middleware
const requireAuth = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }
    next();
};

// Require admin middleware
const requireAdmin = async (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Admin privileges required"
        });
    }
    next();
};

// Export as named exports
export default { authMiddleware, requireAuth, requireAdmin };



