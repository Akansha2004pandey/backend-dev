import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
// this comes with node js
// file system has linked or unlinked file
cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary=async (localFilePath)=>{
    try{
        
        if(!localFilePath){
            return null;
        }
        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        console.log(response.url);
        // file has been uploaded successfully
        console.log("file uploaded successfuly on cloudinary");
        return response;


    }catch(err){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;

    }

}
export {uploadOnCloudinary}
