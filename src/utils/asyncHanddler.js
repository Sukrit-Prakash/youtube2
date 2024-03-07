const asyncHandler =() =>{
    return (req,res,next)=>{
        Promise.resolve(requsetHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}

// const aysncHandler =() => {}
// const aysncHandler = (func)=>{ ()=>{}}

// const aysncHandler = (fn) =>async(req,res,next) =>{
//     try{
//      await fn(req,res,next)
//     }
//     catch(error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }