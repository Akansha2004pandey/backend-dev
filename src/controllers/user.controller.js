// src/controllers/user.controller.js
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    
     // get user details from front end
     // it will depend on the model I have
     // validation- not empty
     // on frontend as well as backend
     // check if user already exists - email, username
     // check for images, check for avatar
     // upload them to cloudinary - its url, avatar
     // create user object - creation call
     // we do not want to give encrypted password to user remove password and refresh token field from response
     // check for response
     //return res
     console.log("hello")
     const {fullName, email, username, password}=req.body;
     console.log(email);
     if([fullName,email,username,password].some((field)=>
         field?.trim()===""
     )){
        throw new ApiError(400,"All fields are required");
     }
     // here we will use operators
    const existedUser= await User.findOne({
          $or: [
            {email},
            {username}
          ]
     })
     if(existedUser){
         throw new ApiError(409,"user already present");
     }
     
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
    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    // select the fields not required
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "something went wrong");
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")

)

    // you can potentially get error catch will handle that as we have made asynct handler

    

     res.send({
        "message":"done"
     })

});

export { registerUser }; 
