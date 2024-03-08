import {asyncHandler} from "../utils/asyncHanddler.js"
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler( async(req,res) =>{


const {fullname,email,username,password } = req.body
console.log("email",email);
if(
  [fullname,email,username,password].some(()=> feild?.trim() === "")
){
      throw new ApiError(400,"all feild are compoulsory")
}

const existedUser= User.findOne({
  $or:[{username},{email}]
})
if(existedUser)
{
  throw new ApiError(409,"User withe email and username alred y exits")
}
 const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;
if(!avatartLocalPath)
{
  throw new ApiError(400,"avaatar file is required")
}

const avatar =await uploadOnCloudinary(avatarLocalPath);
const coverImage =await uploadOnCloudinary(coverImageLocalPath)
if(!avatar)
{
  throw new ApiError(400,"avatar file is  required")
}

const user = await User.create({
  fullname,
  avatar:avatar.url,
  coverImage:coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
})
const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
)
if(!createdUser){
  throw new ApiError(500,"something went wrong while registering the user")
}

return res.status(201).json.json(
  new ApiResponse(200,createdUser,"user reigistered successfully")
)

})
export {registerUser}