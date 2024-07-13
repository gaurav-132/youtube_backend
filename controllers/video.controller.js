import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { transcodeAndUpload } from "../utils/transcodeAndUpload.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const uploadVideo = asyncHandler(async(req, res) => {
    // console.log(req.files); return;
    const { title, description, playlist, audience, visiblity, scheduleDate,scheduleTime } = req.body;

    const videoFilePath = req.files?.videoFile[0].path;
    const thumbnailPath = req.files?.thumbnailFile[0].path;

    // console.log

    console.log(req.files);

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
            playlist,
            audience,
            visiblity,
            scheduleDate,
            scheduleTime,
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


export {
    uploadVideo,
}
