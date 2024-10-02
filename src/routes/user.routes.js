// src/routes/user.routes.js
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; // Ensure correct path and export
import {upload} from "../middlewares/multer.middleware.js"
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


export default router;
