import { Router } from "express"; 
import { loginUser, logoutUser, registerUser, refreshAcessToken, uploadVideo } from "../controllers/user.controller.js";
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

router.route('/upload-video').post(
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

//secured routes
router.route('/logout').post(verifyJwt, logoutUser);   
router.route('/refresh-token').post(refreshAcessToken);   



export default router;