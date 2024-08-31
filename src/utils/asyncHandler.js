const asyncHandler=(requestHandler)=>{
   (req,res,next)=>{
       Promise.resolve(requestHandler).catch((err)=>next(err))
   }
}
export {asyncHandler}
// it returns a function and wraps it around the function passed as parameter

// const asyncHandler = (fn) => async (req,res,next)=>{
//       try {
//           await fn(req,res,next);

//       }catch(error){
//            res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//            })
//       }
// }



