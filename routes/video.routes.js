import { Router } from "express"; 
import { 
    uploadVideo 
} from "../controllers/video.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();


router.route('/upload-video').post(
    verifyJwt,
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnailFile",
                maxCount: 1,
            } 
        ]
    ),
    uploadVideo
)




export default router;