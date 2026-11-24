import express from "express"
import cors from "cors"

import { errorMiddleware } from "./middlewares/error.middleware.js";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import categoryRoutes from "./routes/category.routes.js";

const  app = express()

// Applicaation level Middleware 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/test", testRoutes);

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