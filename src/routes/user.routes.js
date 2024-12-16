// src/routes/user.routes.js
import { Router } from "express";
import { registerUser,logOutUser,loginUser ,refreshAccessToken, changeCurrentPassword, getUserChannelProfile, getUserWatchHistory} from "../controllers/user.controller.js"; // Ensure correct path and export
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verify } from "jsonwebtoken";
const router = Router();
console.log("problem");
router.route("/register").post(
    upload.fields([
       {
        name:"avatar",
        maxCount:1
       },{
           name:"coverImage",
           maxCount:1
       }
    ]),
    registerUser); 
// when someone goes to register route this method is executed 

router.route("/login").post(loginUser);
//secured routes
router.route("/logout").post(verifyJWT,logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword
);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile);
router.route("/watchHistory").get(verifyJWT,getUserWatchHistory);

export default router;
