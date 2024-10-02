import {Router} from "express"
import {upload} from "../middlewares/multer.middleware.js"
import { checkImage } from "../controllers/image.controller.js";
const router=Router();
router.route("/image").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
       },{
           name:"coverImage",
           maxCount:1
       }

]),checkImage);


export default router;