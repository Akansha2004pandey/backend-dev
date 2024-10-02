import mongoose, {Schema} from "mongoose"
const imageSchema=new Schema({
    avatar:{
        type:String,
        required:true,


    },
    coverImage:{
        type:String
    },
})
export const Image=mongoose.models.Image ||  mongoose.model("Image",imageSchema);