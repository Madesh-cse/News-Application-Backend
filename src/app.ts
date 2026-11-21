import express from "express"
import cors from "cors"

import { errorMiddleware } from "./middlewares/error.middleware.js";
import articleRoutes from "../src/routes/article.routes.js"

const  app = express()

// Applicaation level Middleware 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/v1/articles", articleRoutes);

// create a Health check endpoint
app.use("/api/health", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "News Article API is running",
        timestamp: new Date().toISOString()
    });
});

// Register after all application routes
app.use(errorMiddleware);


export default app;