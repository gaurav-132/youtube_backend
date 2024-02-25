import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";
import { response } from 'express';



const registerUser = asyncHandler( async(req,res) => {
    const { email, username, fullName, password } = req.body;

    if([fullName, email, username, password].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required!");
    }

    const existedUser = await User.find({ $or: [{ email }, { username }] });

    if(existedUser.length > 0){
        throw new ApiError(409, "User Already Exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required!");
    }

    console.log(avatar, coverImage);

    const user = await User.create({ 
        fullName,
        avatar: avatar.url, 
        email,
        password, 
        coverImage: coverImage?.url || "", 
        username: username.toLowerCase() 
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Internal Server Error");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully!")
    );



});

const generateAccessAndRefereshToken = async (userId) => {
    try{    
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken};
    }catch(err){
        throw new ApiError(500, "Something went wrong while generating token");
    }
}

const loginUser = asyncHandler( async(req,res) => {
    const { email, username, password } = req.body;

    console.log(username, password);


    if(!(username || email)){
        throw new ApiError(400, "Username or password is required");
    }
    const user = await User.findOne({ 
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(" -password, -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken
            },
            "User logged in successfully"
        )
    )


});


const logoutUser = asyncHandler( async(req, res) => {
    
    const user = await findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true //to get new updated value
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {},"User logged out successfully!"));
});

const refreshAcessToken = asyncHandler(async(req, res)=>{
    try{
        const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if(!incommingRefreshToken){
            throw new ApiError(401, "Unauthorized Reques");
        }

        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token!");
        }

        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(400, "Refresh token is Expired or Used");
        }

        const token = await generateAccessAndRefereshToken(user?._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return response
        .status(200)
        .cookie("accessToken", token.accessToken, options)
        .cookie("refreshToken", token.refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken: token.accessToken, refreshToken :  token.refreshToken },
                "Access Token refreshed successfully!"
            )
        )
    }catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
});


export { registerUser, loginUser, logoutUser, refreshAcessToken };