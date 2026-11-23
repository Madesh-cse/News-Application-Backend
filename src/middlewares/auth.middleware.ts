import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { verifyAccessToken } from "../utils/jwt.util.js";
import ApiError from "../utils/ApiError.js";
import UserModel from "../models/user.model.js";

export const authenticate: RequestHandler = async  (req, res, next) =>{
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
        // Retrive the current version of token
        const user = await UserModel.findById(decoded.sub).select("tokenVersion status");
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
        // check accoutn status
        if(user.status !== "active"){
            throw new ApiError(403, "Your account is blocked");
        }
        // compare the token version
        const currentTokenVersion = user.tokenVersion ?? 0;
        if (decoded.tokenVersion !== currentTokenVersion){
            throw new ApiError(401, "Access token has been revoked");
        }
        // Attach authenticated user information
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