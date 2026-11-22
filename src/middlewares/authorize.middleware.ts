import type { RequestHandler } from "express";
import ApiError from "../utils/ApiError.js";

type UserRole = "admin" | "editor" | "reader";

export const authorize = (...allowedRoles: UserRole[]): RequestHandler => {
    return (req,res,next)=>{
        if(!req.user){
            return next(new ApiError(401, "Authentication required"));
        }
        if(!allowedRoles.includes(req.user.role)){
            return next( new ApiError(403, "You do not have permission to perform this action"))
        }
        next();
    }
}