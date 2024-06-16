import connectDB from "./db/index.js";
import dotenv from "dotenv";



dotenv.config({
    path: './env'
})

connectDB();


                                                                                                                                       




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