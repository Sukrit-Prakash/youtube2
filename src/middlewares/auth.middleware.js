// it verifies wether the user is logged in or not

import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHanddler.js";
import jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
// sometimes we ddont need the value so we use underscore
export const verifyJWT = asyncHandler(async(req,_,next)=>{
try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token)
    {
        throw new ApiError(401,"unauthorised request")
    }
    const decodedToken = jwt.veriify(token,process.env.ACCESS_TOKEN_SECRET)    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user)
    {
        throw new ApiError("401","invalid access token")
    
    }
    
    req.user = user;
    next()
} catch (error) {
    throw new ApiError(401,error?.mesage || "invalid access token" )
}
})