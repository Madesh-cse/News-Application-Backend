import mongoose from "mongoose";
import ArticleModel from "../models/article.model.js";

export const connectDb = async(): Promise<void> =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log("MongoDB connected successfully");
        const indexes = await ArticleModel.collection.indexes();
        console.log("Article text indexes:",indexes.filter((index) => index.weights));
    }
    catch(error:any){
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}