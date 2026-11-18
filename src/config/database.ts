import mongoose from "mongoose";

export const connectDb = async(): Promise<void> =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log("MongoDB connected successfully")
    }
    catch(error:any){
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}