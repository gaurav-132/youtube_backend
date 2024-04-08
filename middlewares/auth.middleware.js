import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";


export const verifyJwt = asyncHandler(async(req, _, next)=>{
    try{
        console.log(req.cookies);
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ","");

        if(!token){
            throw new ApiError(401, "Unathorized Request!");
        }


        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError("401", "Invalid Access Token!");
        }

        req.user = user;

        next();
    }catch(err){
        throw new ApiError(401, err?.message || "Invalid Access Token!");
    }
});