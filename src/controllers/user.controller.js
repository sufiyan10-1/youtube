import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


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
export {registerUser}