import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'


const registerUser = asyncHandler( async(req,res) => {
    const { email, username, fullname, password } = req.body;

    if([fullname, email, username, password].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required!");
    }

    let existedUser = User.find({ $or: [{ email }, { username }] });

    if(existedUser){
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



} )


export { registerUser };