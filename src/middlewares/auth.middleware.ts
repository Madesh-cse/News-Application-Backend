import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { verifyAccessToken } from "../utils/jwt.util.js";
import ApiError from "../utils/ApiError.js";

export const authenticate: RequestHandler = (req, res, next) =>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            throw new ApiError(401, "Access token is required");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
           throw new ApiError(401, "Access token is required");
        }
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch(error){
        if (error instanceof ApiError){
            return next(error);
        }
        if (error instanceof jwt.TokenExpiredError ||error instanceof jwt.JsonWebTokenError) {
            return next(new ApiError(401, "Invalid or expired access token"));
        }
        next(error);
    }
}