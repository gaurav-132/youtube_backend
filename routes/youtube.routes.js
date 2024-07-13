import express from 'express';
import { 
    submitComment, 
    getVideos, 
    getPlayingVideo, 
    getPostComments, 
    submitCommentReply,
    getCommentReplies,
    likeDislikePost,
    getCarauselData,
    getVideoData,
    subscribeChannel,
} from '../controllers/youtube.controller.js';
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.route('/get-videos').post(getVideos);

router.route('/get-carausel-data').post(getCarauselData);

router.route('/submit-comment').post(verifyJwt, submitComment);
router.route('/submit-comment-reply').post(verifyJwt, submitCommentReply);

router.route('/get-comment-replies').post(getCommentReplies);
router.route('/like-dislike-post').post(verifyJwt, likeDislikePost);

router.route('/get-playing-video/:id').get(getPlayingVideo);  
router.route('/get-post-comments/:postId').get(getPostComments);  

router.route('/get-video-info').post(verifyJwt,getVideoData);  
router.route('/subscribe').post(verifyJwt,subscribeChannel);  




export { router as youtubeRouter };