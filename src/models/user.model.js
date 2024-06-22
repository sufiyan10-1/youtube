import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcript from "bcrypt"

//data mondel
const userSchema = new Schema({
   username: {
     type: String,
     required: true,
     unique: true,
     lowercase: true,
     index: true
   },
   email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  fullname: {
    type: String,
    required: true,
    index: true
  },
  avatar: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
    watchHistory:[
   {
    type: Schema.Types.ObjectId,
    ref: "Video"
   },
],
  password: {
    type: String,
    required: [true, "password is required"]
  },
  refreshToken:{
    type: String
  }
  
},{timestamps: true})

// password increpted
userSchema.pre("save", async function (next){
  if(!this.isModified("password")) return next();
  else
  this.password = bcript.hash(this.password, 10)
  next()
})

//compare the password
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcript.compare(password, this.password)
}
//JWT tokens 
userSchema.method.generateAccessToken = function(){
  jwt.sign(
    {
      _id: this._id,
       email: this.email,
       username: this.username,
       fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.method.generateRefreshToken = function(){
  jwt.sign(
    {
      _id: this._id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}
export const user = mongoose.model("User", userSchema)