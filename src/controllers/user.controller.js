// src/controllers/user.controller.js
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken =await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
  
        return {accessToken, refreshToken};


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
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
     
     const avatarLocalPath = req.files?.avatar[0]?.path;
     //const coverImageLocalPath = req.files?.coverImage[0]?.path;
 
     let coverImageLocalPath;
     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
         coverImageLocalPath = req.files.coverImage[0].path
     }
     
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    let coverImage=null;
    if(coverImageLocalPath){
      coverImage= await uploadOnCloudinary(coverImageLocalPath);
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


const loginUser=asyncHandler(async (req,res,next)=>{
    const {email,username,password}=req.body;
    console.log(req.body);
    console.log("hello")
    if (!email && !username) {
        throw new ApiError(400, "Email or username required");
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(400,"user does not exist");
    }
    const isPasswordValid=await user.isPasswordCorrect(password); // it is available for instance of userSchema
    if(!isPasswordValid){
        throw new ApiError(401,"password is incorrect");
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    //destructuring
    const loggedInUser=User.findById(user._id).select("-password -refreshToken");
    const options={
        httpOnly:true,
        secure:true,
    }
    console.log("lagbhag ho gya")
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser.toObject,
                accessToken,
                refreshToken
            }
            ,
            "User Logged In Successfully"
        )
    )
     


})
const logOutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
         throw new ApiError(401,"no incoming RefreshToken");
    }
    try{
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401,"Invalid Refresh Token");
    }
    if(incomingRefreshToken!== user?.refreshAccessToken){
        throw new ApiError(401,"Refresh Token is expired or used");
    }
     
    const  {accessToken,refreshToken}=generateAccessAndRefreshToken(user._id);
    
    const options={
        httpOnly:true, /* to prevent client side js to modify the token */
        secure:true // cookie will be sent only over https
    }
    return res.status(200)
    .cookie("accessToken",token.accessToken,options)
    .cookie("refreshToken",token.refreshToken,options)
    .json(new ApiResponse(200,{
        accessToken,
        refreshToken
    }, "successfully created new access token"));

    }catch(error){
        throw new ApiError(400,error?.message || "something went wrong");
    }

})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.password;
    const user=User.findById(req.user?._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
         throw new ApiError(401,"old password is incorrect");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"password changed successfully"));
   
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id);
    return res.status(200).json(new ApiResponse(200,user,"current user fetched successfully"));
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
     const {fullName, email}=req.body;
     if(!fullName && !email){
        throw new ApiError(400,"fullName and email are required");
     }
     User.findByIdAndUpdate(req.user?._id,{$set:{
         fullName,
         email: email
     }},{
         new:true
     }).select("-password -refreshToken")
     return res.status(200).json(new ApiResponse(200,{},"account details updated successfully"));
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;

    if(!avatar){
        throw new ApiError(400,"avatar is required");
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400,"error while uploading the avatar");

    }

    const user=await User.findByIdAndUpdate(req.user?._id,
    {$set:{
        avatar:avatar.url
    }},
    {new:true}

    ).select("-password");
    
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"avatar updated successfully"));
})
 const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage is required");
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError(400,"error while uploading the coverImage");
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {$set:{
            coverImage:coverImage.url
        }},{new:true}).select("-password");
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"coverImage updated successfully"));
 })

export { registerUser, loginUser ,logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails,updateUserAvatar,updateUserCoverImage}; 
