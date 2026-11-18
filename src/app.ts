import express from "express"
import cors from "cors"

import { notfound, errorHandlder } from "./middlewares/error.middleware.js"

const  app = express()

// Applicaation level Middleware 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))


// create a Health check endpoint
app.use("/api/health", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "News Article API is running",
        timestamp: new Date().toISOString()
    });
});

// Register after all application routes
app.use(notfound);
app.use(errorHandlder);


export default app;