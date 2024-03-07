const aysncHandler =() =>{
    (req,res,next)=>{
        Promise.resolve(requsetHandler(req,res,next)).catch((err) => next(err))
    }
}

export {aysncHandler}

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