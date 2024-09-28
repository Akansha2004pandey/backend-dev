import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true

}))

//initially we had to use body parser

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser());


// for files we use third party package multer
// when I have data from url then all use it
// routes import
import userRouter from "./routes/user.routes.js"
import middlewareWrapper from "cors"
//routes declaration
//now we need middlewareWrapper
app.use("/api/v1/users",userRouter);
// http://localhost:8000/users/register
export {app}