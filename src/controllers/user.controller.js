import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens = async(userId) =>{
      try {
          const user = await User.findById(userId);
          const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()

          user.refreshToken = refreshToken
          await user.save({validateBeforeSave: false })

          return {accessToken, refreshToken}
      } catch (error) {
          throw new ApiError(500, "something went wrong while generating refresh token")
      }
}

const registerUser = asyncHandler( async (req, res)=>{
//step 1: get user details form frontend
     const {fullName, email, username, password} = req.body
 

//step 2: validation (not empty)

        // if(fullName === ""){
     //   throw new ApiError(400, "fullname is required")
     // } so on....
     if([fullName, email, password, username].some((field)=>field?.trim() === "")){
          throw new ApiError(400, "fullname is required")
     }
//step 3: check if user already exists: username, email
     const existedUser = await User.findOne({
         $or: [{username},{email}]
      })
      if(existedUser){
          throw new ApiError(409, "user with same email or username already exists")
      }

 //step 4: check for images, check for avatar
     
     const avatarLocalPath =  req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;

     if(!avatarLocalPath){
          throw new ApiError(400, "Avatar is required")
     }
       
//step 5: upload them to cloudnary, avatar
       const avatar = await uploadOnCloudinary(avatarLocalPath)
       const coverImage = await uploadOnCloudinary(coverImageLocalPath)

       if(!avatar){
          throw new ApiError(400, "Avatar file is required");
       }
//step 6: create user object- create entry in db
      
      const user = await User.create({
          fullName,
          avatar: avatar.url,
          coverImage: coverImage?.url || "",
          email,
          password,
          username: username.toLowerCase()
      })

     
   
//step 7: remove password and refresh token field form response


     const createdUser = await User.findById(user._id).select(
          "-password -refreshToken"
     )
      
//step 8: check for user creation 
        
 
     if(!createdUser){
        throw new ApiError(500, "somthing went wrong while regestering the user")
      }
//step 9: return res
       
      return res.status(201).json(
          new ApiResponse(200, createdUser, "User register successfully")
      )

    
    
   
})

const loginUser = asyncHandler( async (req, res) =>{
//step 1: data from req body
    
   const {email, username, password} = req.body;
//step 2: username or password
  
   if(!email && !username){
     throw new ApiError(400, "username or email is required")
   }
//step 3: find the user
    
  const user = await User.findOne({
     $or: [{username}, {email}]
   })
   if(!user){
     throw new ApiError(404, "user does not exist")
   }
//step 4: password check

     const isPasswordCorrectValid =  await User.isPasswordCorrect(password)

     if(!isPasswordCorrectValid){
          throw new ApiError(401, "Invalid user and password")
     }
//step 5: access and referesh token

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
//step 6: send cookie
     
     const options ={
          httpOnly: true,
          secure: true
     }
     return res
     .status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken", refreshToken, options)
     .json(
          new ApiResponse(
               200,
               {
                    user: loginUser,accessToken,refreshToken
               },
               "user logged In successfully"
          )
     )
})
const logoutUser = asyncHandler(async (req, res)=>{
    User.findByIdAndUpdate(
     req.user._id,
     {
          $set: {
            refreshToken: undefined
          }
     },
     {
          new : true
     },
     
    )
    const options ={
     httpOnly: true,
     secure: true
}

return res
  .status(200)
  .clearCookie("accessToken")
  .clearCookie("refreshToken")
  .json(new ApiResponse(200, {}, "user logged out"))
  
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(incomingRefreshToken){
     throw new ApiError(401, "unauthhorized request");
  }
  try {
     const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
     )
     const user = await User.findById(decodedToken?._id)
   
     if(!user){
        throw new ApiError(500, "Invalid refresh token")
     }
     if(incomingRefreshToken !== user?.refreshAccessToken){
        throw new ApiError(401, "refresh token is expired")
     }
   
     const options = {
        httpOnly: true,
        secure: true
     }
    const {accessToken, newRefreshToken} =  await generateAccessAndRefereshTokens(user._id)
   
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken , options)
     .json(
        new ApiResponse(
             200,
             {accessToken, refreshToken: newRefreshToken},
             "Access token refresh"
        )
     )
  } catch (error) {
     throw new ApiError(401, error?.message || "invalid refresh token")
  }
})
export {
     registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken
}