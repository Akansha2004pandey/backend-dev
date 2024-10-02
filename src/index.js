//require('dotenv').config({path:"./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:"./env"
})
/*
;(async ()=>{
    try{
        mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("application not able to talk to the database");
            throw error
        })
        app.listen(process.env.PORT,()=>{
             console.log(`application is listening on ${process.env.PORT}`)
        })
    }catch(err){
        console.log("Error: ",err)
        throw err
    }
})()
*/

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
         console.log("server running")
         console.log(`listening to port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed!!",err)
})



