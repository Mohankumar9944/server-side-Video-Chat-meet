import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const protectRoute= async (req, res, next) => {
    try {
        const token= req.cookies.jwt;

        if(!token) {
            return res.json({ message: "Unauthorized - No token provided" });
        }

        const decoded=jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decoded){
            return res.json({ message: "Unauthorized - Invalid token" });
        }

        const user=await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] },
        });
        if(!user){
            return res.json({ message: "Unauthorized - User not found" });
        }

        req.user=user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware", error);
        res.json({ message: "Internal Server Error" });
    }
}