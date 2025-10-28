const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(400).json({
                success: false,
                message: "Authorization token is required"
            })
        }
        const token = authHeader.split(" ")[1];
        let decoded
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY)
        } catch (error) {
            if(error.name === "TokenExpiredError"){
                return res.status(400).json({
                    success: false,
                    message: "The Registeration Token has expired"
                })
            }
            return res.status(400).json({
                success: false,
                message: "Access Token is missing or invalid"
            })
        }
        const user = await User.findOne({_id: decoded.id})
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        req.user = user
        req.id = user._id
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

const isAdmin = async (req, res, next) => {
    const userRole = req.user.role
    if(req.user && userRole === "admin"){
        next()
    } else {
        return res.status(400).json({
            success: false,
            message: "You are not an admin"
        })
    }
};

module.exports = { isAuthenticated, isAdmin };