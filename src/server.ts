import "../src/dns.js"
import dotenv from "dotenv"

dotenv.config()
import app from "./app.js"
import { connectDb } from "./config/database.js"

const port = process.env.PORT || 5000;

//  create  a start server function
 const startSever = async(): Promise<void> =>{
    try{
        await connectDb();
        app.listen(port, ()=>{
            console.log(`Server running on port ${port}`);
        })
    }
    catch(error:any){
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

 startSever()