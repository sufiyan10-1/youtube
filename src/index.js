import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";



dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
      console.log("Express Error", error);
      throw error;
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is runing at port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Mongo db connection feild !!!", error)
})


                                                                                                                                       




// import mongoose, { connect } from "mongoose";
// import { DB_NAME } from "./constants";
// const app = express;

// ;(async ()=>{
//     try{
//      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//      app.on("error", (error)=>{
//         console.log("ERROR", error);
//         throw error;
//      })
//      app.listen(process.env.PORT, ()=>{
//         console.log(`app is listening on port ${process.env.PORT}`)
//      })
//     }catch(error){
//         console.log("Database Error: ", error)
//          throw err
//     }
// })()