import {asyncHandler} from "../utils/asyncHanddler.js"
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
const generateAccessAndRefreshTokens = async(userId) =>{
  try{
     const user= await User.findById(userId)
     const accessToken =user.generateRefreshToken()
     const refreshToken= user.generateAccessToken()
     user.refreshToken = refreshToken
     await  user.save({validateBeforeSave:false})
     return{accessToken,refreshToken}
  }
  catch(error){
    throw new ApiError(500,"sommething went wrong while generatingrefresh token")
  }
}

const registerUser = asyncHandler( async(req,res) =>{


const {fullname,email,username,password } = req.body
console.log("email",email);
if(
  [fullname,email,username,password].some((feild)=> feild?.trim() === "")
){
      throw new ApiError(400,"all feild are compoulsory")
}

const existedUser=await User.findOne({
  $or:[{username},{email}]
})
if(existedUser)
{
  throw new ApiError(409,"User withe email and username alred y exits")
}
 const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.converImage.length >0)
{
  coverImageLocalPath = req.files.converImage[0].path;
}

if(!avatarLocalPath)
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
const loginUser = asyncHandler(async(req,res)=>{
  // todo list 
  // req body -> data
  //username or email
  //find the user
  //password
  //accesss and refresh token
  //send cookie
  const{email,username,password} = req.body
  if(!username && !email)
  {
   throw new ApiError(400,"username or email is required")
  }
  const user = await User.findOne({
    $or:[{username},{email}]
  })
  if(!user)
  {
    throw new ApiError(404,"user does not exits")
  }
const isPasswordValid = await user.isPasswordCorrect(password)
if(!isPasswordValid)
  {
    throw new ApiError(401,"password incorrect")
  }

const {accessToken,refreshToken}  =await generateAccessAndRefreshTokens(user._id)

const loggedInUser=await User.findById(user._id).select("-pasword -refreshToken")//optional step
//cookies
const options ={
  httpOnly:true,
  secure:true
}
//now the cookies are only modifiable by the server
return res.status(200)
.cookie("accessToken", accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResponse(
    200,
    {
      user:loggedInUser,accessToken,
      refreshToken
    },
    "user is logged in succesfully"
  )
)
})
const logoutUser = asyncHandler(async(req,res)=>{
  //clear coookies
  //resetting the refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new: true
    }
  )

  const options ={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out"))
  //find by update is better than find by id
  //we dont want user to enter their email and password for logging out
  //so we design an authentication middleware
})
const refreshAccessToken = asyncHandler(async(req,res)=>{
 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
if(!incomingRefreshToken)
{
  throw new ApiError(401,"unauthorised request")
}
try {
  const decodedToken = jwt.verify(incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET)
  
    const user=  await User.findById(decodedToken?._id)
    if(!user)
    {
      throw new ApiError(401,"invalid refresh token")
    }
    if(incomingRefreshToken !== user?.refreshToken)
    {
      throw new ApiError(401,"refrshf toke n is expored or used")
    }
    const option ={
      httpOnly:true,
      secure:true
    }
  
  const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
  return res
  .status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",newrefreshToken,option)
  .json(
    new ApiResponse(
      200,
      {
        accessToken,refreshToken:newrefreshToken
      },
      "Access token refreshed successfully"
    )
  )
} catch (error) {
  throw new ApiError(401,error?.message || "invalid refresh token")
}

})

export {registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}