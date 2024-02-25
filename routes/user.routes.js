import { Router } from "express"; 
import { loginUser, logoutUser, registerUser, refreshAcessToken } from "../controllers/user.controller.js";
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
router.route('/refresh-token').post(refreshAcessToken);   



export default router;