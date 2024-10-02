import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Image } from "../models/image.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/apiError.js";

const checkImage=asyncHandler(async  (req,res)=>{

    const avatarLocalPath = req.files['avatar'] ? req.files['avatar'][0] : undefined;
    const coverImageLocalPath = req.files['coverImage'] ? req.files['coverImage'][0] : undefined;
   if(!avatarLocalPath){
       throw new ApiError(400,"avatar required")
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath);
   if(coverImageLocalPath){
      const coverImage= await uploadOnCloudinary(coverImageLocalPath);
   }
   if(!avatar){
       throw new ApiError(400,"avatar necessary");

   }
   const image=await Image.create({
    avatar: avatar.url,
    coverImage:coverImage?.url || "",
   });
   const imageDone=await User.findById(image._id)
if(!imageDone){
    throw new ApiError(500, "something went wrong");
}
return res.status(201).json(
    new ApiResponse(200, imageDone, "user registered successfully")


)
res.send({
    "message":"done"
 })
});


export {checkImage};