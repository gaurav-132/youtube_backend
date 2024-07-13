import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        // Extract token from authorization header
        const token = req.headers.authorization?.replace("Bearer ", "");

        // Check if token exists
        if (!token) {
            throw new ApiError(401, "Unauthorized Request!");
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    
        if (!user) {
            return res.status(401).json({ status: 401, message: "Invalid Access Token!" });
        }

        req.user = user;

        next();
    } catch (err) {
        // Handle different error scenarios
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 401, message: "TokenExpired" });
        } else {
            return res.status(401).json({ status: 401, message: "Invalid Access Token!" });
        }
    }
});
