import { Router } from "express"; 
import { loginUser, 
    logoutUser, 
    registerUser, 
    refreshAcessToken, 
    uploadVideo, 
    getUserVideos,
} from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1,
            },
            {
                name: "coverImage",
                maxCount: 1,
            }        
        ]
    ), 
    registerUser
);

router.route('/login').post(loginUser);



//secured routes
router.route('/logout').post(verifyJwt, logoutUser);  
router.route('/upload-video').post(
    verifyJwt,
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            } 
        ]
    ), 
    uploadVideo,
);


router.route('/get-videos').get(verifyJwt, getUserVideos);

router.route('/refresh-token').post(refreshAcessToken);   



export default router;