import { Video } from '../models/video.model.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { PostComment } from '../models/postComment.model.js';
import { LikeDislike } from '../models/likeDislike.model.js';

const getCarauselData = async (req, res) => {
    const carauselData = ["All", "Mixes", "Tamil Cinema", "Dramedy", "Music","Live","Mantras", "Programming", "Javascript", "Data Structure"];

    return res.status(200).json({ carauselData  });
}

const getVideos = async (req, res) => {
    try {
        const videos = await Video.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'ownerInfo'
                }
            },
            {
                $unwind: '$ownerInfo'
            },
            {
                $project: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    playlist: 1,
                    audience: 1,
                    visibility: 1,
                    scheduleDate: 1,
                    scheduleTime: 1,
                    duration: 1,
                    views: 1,
                    isPublished: 1,
                    owner: 1,
                    'ownerInfo.username': 1,
                    'ownerInfo.email': 1,
                    'ownerInfo.fullName': 1,
                    'ownerInfo.avatar': 1
                }
            }
        ]);

        return res.status(200).json({ videos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const getPlayingVideo = asyncHandler(async(req, res) => {
    try {
        const { id } = req.params;

        const ObjectId = new mongoose.Types.ObjectId(id);
        
        const video = await Video.aggregate([
            {
                $match: { _id: ObjectId }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'ownerInfo'
                }
            },
            {
                $unwind: '$ownerInfo'
            },
            {
                $project: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    playlist: 1,
                    audience: 1,
                    visibility: 1,
                    scheduleDate: 1,
                    scheduleTime: 1,
                    duration: 1,
                    views: 1,
                    isPublished: 1,
                    owner: 1,
                    'ownerInfo.username': 1,
                    'ownerInfo.email': 1,
                    'ownerInfo.fullName': 1,
                    'ownerInfo.avatar': 1,
                }
            }
        ]);

        

        if(!video[0]){
            throw new ApiError(404, "Video not found!");
        }


        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video[0],
                "Video founded!"
            )
        )
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}); 


const submitComment = asyncHandler(async(req, res) => {
    try {
        const { comment, postId } = req.body;

        if(comment === ""){
            throw new ApiError(400, "Please must write a comment");
        }

        const resp = await PostComment.create({
            comment,
            userId: req?.user?._id,
            postId,
        });

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                resp,
                "Commented Sucessfull",
            )
        )

    } catch (error) {
        throw new ApiError(200, error.message)
    }
});

const getPostComments = asyncHandler(async(req, res) => {
    try {
        const { postId } = req?.params;

        const ObjectId = new mongoose.Types.ObjectId(postId);

        const comments = await PostComment.aggregate([
            {
                $match: { postId: ObjectId, parentCommentId: null }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    _id: 1,
                    comment: 1,
                    'userInfo.username': 1,
                    'userInfo.avatar': 1
                }
            }
        ]);

        if(comments.length === 0) throw new ApiError(400, "No Comments found!"+postId);

        for (let comment of comments) {
            const replyCount = await PostComment.aggregate([
                {
                    $match: {
                        parentCommentId: comment._id
                    }
                },
                {
                    $group: {
                        _id: '$parentCommentId', 
                        count: { $sum: 1 } // Count the number of matching documents
                    }
                }
            ]);
            comment.replies = replyCount.length > 0 ? replyCount[0].count : 0;
        }



        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Comments fetched successfully!"
            )
        )

    } catch (error) {
        throw new ApiError(400, error.message);
    }
});


const submitCommentReply = asyncHandler(async(req, res) => {
    try {
        const { comment, postId, parentCommentId } = req.body;

        if(comment === ""){
            throw new ApiError(400, "Please must write a comment");
        }

        const resp = await PostComment.create({
            comment,
            userId: req?.user?._id,
            postId,
            parentCommentId
        });

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                resp,
                "Commented Sucessfull",
            )
        )

    } catch (error) {
        throw new ApiError(200, error.message)
    }
});


async function fetchCommentsWithReplies(postId, parentCommentId = null) {
    const comments = await PostComment.aggregate([
        {
            $match: { postId: new mongoose.Types.ObjectId(postId), parentCommentId: parentCommentId ? new mongoose.Types.ObjectId(parentCommentId) : null }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $project: {
                _id: 1,
                comment: 1,
                'userInfo.username': 1,
                'userInfo.avatar': 1
            }
        },
        {
            $sort: { createdAt: -1 } // Optional: sort by creation date
        }
    ]);

    for (let comment of comments) {
        comment.replies = await fetchCommentsWithReplies(postId, comment._id);
    }

    return comments;
}


const getCommentReplies = asyncHandler(async (req, res) => {
    try {
        const { postId } = req.params;

        const commentReplies = await fetchCommentsWithReplies(postId);

        return res.status(200).json({
            status: 'success',
            data: commentReplies,
            message: "All comments with replies fetched successfully!"
        });

    } catch (error) {
        throw new ApiError(400, error.message);
    }
});



const likeDislikePost = asyncHandler(async(req, res) => {
    const { like, dislike, postId } = req.body;
    try {
        if(!postId){
            throw new ApiError(400, "Please Like a valid post");
        }

        const checkAlreadyLikeOrDislike = await LikeDislike.findOne({ userId: req.user?._id, postId: postId });
        
        console.log(checkAlreadyLikeOrDislike);
        
        if(checkAlreadyLikeOrDislike){
            let updateObject = {};
            if(like){
                console.log("insert like");
                updateObject.like = !checkAlreadyLikeOrDislike.like;
                updateObject.dislike = 0;
            }else if(dislike){
                console.log("insert dislike");
                updateObject.dislike = !checkAlreadyLikeOrDislike.dislike;
                updateObject.like = 0;
            }
            await LikeDislike.updateOne({ _id: checkAlreadyLikeOrDislike._id}, {$set: updateObject});
        }else if(like){
            console.log("update like");
            await LikeDislike.create({
                userId: req?.user?._id,
                postId: postId,
                like
            });
        }else if(dislike){
            console.log("update dislike");
            await LikeDislike.create({
                userId: req?.user?._id,
                postId: postId,
                like
            });
        }
        
        

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Action",
            )
        )

    } catch (error) {
        throw new ApiError(500, error.message)
    }
});

const getVideoData = asyncHandler(async (req, res) => {
    const { postId } = req.body;

    // Ensure postId is a valid ObjectId
    const modifiedPostId = new mongoose.Types.ObjectId(postId);


    try {
        
        const likesArray = await LikeDislike.aggregate([
            {
                $match: { postId: modifiedPostId, like: 1 }
            },
            {
                $project: {
                    _id: 1,
                    like: 1,
                }
            }
        ])

        const likesCount = likesArray.length;

        const isUserLiked = await LikeDislike.findOne({ postId: modifiedPostId, userId: req?.user?._id });

        let userLiked = false;
        let userDisliked = false;
        if(isUserLiked.like){
            userLiked = true;
        }else if(isUserLiked.dislike){
            userDisliked = true;
        }
    
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    userLiked,
                    userDisliked,
                    likesCount
                }
                ,
                "Video info retrieved successfully!"
            )
        );
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message));
    }
});

const subscribeChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.body;

    const modifiedChannelId = new mongoose.Types.ObjectId(channelId);

    try {
        
        const likesArray = await LikeDislike.aggregate([
            {
                $match: { postId: modifiedPostId, like: 1 }
            },
            {
                $project: {
                    _id: 1,
                    like: 1,
                }
            }
        ])

        const likesCount = likesArray.length;

        const isUserLiked = await LikeDislike.findOne({ postId: modifiedPostId, userId: req?.user?._id });

        let userLiked = false;
        let userDisliked = false;
        if(isUserLiked.like){
            userLiked = true;
        }else if(isUserLiked.dislike){
            userDisliked = true;
        }
    
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    userLiked,
                    userDisliked,
                    likesCount
                }
                ,
                "Video info retrieved successfully!"
            )
        );
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message));
    }
});


export { getCarauselData, 
    getVideos, 
    getPlayingVideo, 
    submitComment,
    getPostComments, 
    submitCommentReply,
    getCommentReplies,
    likeDislikePost,
    getVideoData,
    subscribeChannel,
};