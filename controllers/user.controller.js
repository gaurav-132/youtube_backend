import { User } from '../models/user.model.js';
import { Video } from '../models/video.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { transcodeAndUpload } from '../utils/transcodeAndUpload.js';
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

    if(user){
        
    }

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

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // console.log(accessToken, refreshToken);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken};
    }catch(err){
        throw new ApiError(500, "Something went wrong while generating token");
    }
}

const loginUser = asyncHandler( async(req,res) => {
    const { email, username, password } = req.body;

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
                user: loggedInUser, accessToken, refreshToken
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


const changeUserPassword = asyncHandler(async (req,res) => {
    const { newPassword, oldPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Password!");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"));
});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(200,req.user, "Current user fetched successfully!")
});

const updateAccountDetails = asyncHandler(async(req, res) => {
    const { fullName, email } = req.body;

    if(!(fullName || email)){
        throw new ApiError(400, "All fields are required");
    };

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { email, password }
        },
        {
            new: true,
        }    
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Account Details Updated Successfully!")
    );

});

const updateAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.files?.avatar[0].path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar : avatar.url }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar Updated Successfully!"
        )
    )
});

const updateCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocaPath = req.files?.coverImage[0].path;

    if(!coverImageLocaPath){
        throw new ApiError(400, "Cover Image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocaPath);

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverImage : coverImage.url }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Cover Image Updated Successfully!"
        )
    )
});

const uploadVideo = asyncHandler(async(req, res) => {

    const { title, description } = req.body;

    const videoFilePath = req.files?.videoFile[0].path;
    const thumbnailPath = req.files?.thumbnail[0].path;

    // console.log(req.user);

    if(!(videoFilePath && thumbnailPath)){
        throw new ApiError(400, "Video file or thumbnail not Found");
    }

    const videoFile = await transcodeAndUpload(videoFilePath);

    const thumbnailFile = await uploadOnCloudinary(thumbnailPath);


    if(!(videoFile.url && thumbnailFile.url)){
        throw new ApiError(400,"Error while uploading video");
    }

    const saveVideo = await Video.create(
        {
            videoFile : videoFile.url,
            thumbnail : thumbnailFile.url, 
            title,
            description, 
            owner : req.user?._id
        }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            saveVideo,
            "Video Uploaded Successfully!"
        )
    );
});

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const { username } = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "Username is Missing");
    }

    const user = await User.aggregate([

    ]);
});

const getUserVideos = asyncHandler(async(req, res) => {
    
    const videos = await Video.find({ owner: req.user._id });

    const formattedVideos = videos.map(video => {
        const date = new Date(video.createdAt);
        const formattedDate = date.toLocaleDateString('en-GB');
        
        const videoObject = video.toObject(); // Convert Mongoose document to plain object
    
        // Add the date field to the plain object
        return {
            ...videoObject,
            date: formattedDate
        };
    });
    
    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            formattedVideos,
            "Videos Fetched Successfully"
        )
    );

});



export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAcessToken, 
    changeUserPassword, 
    getCurrentUser,
    updateAccountDetails,
    updateCoverImage,
    updateAvatar,
    uploadVideo,
    getUserVideos,
};