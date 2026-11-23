import type { Request, Response, NextFunction } from "express";
import userService from "../services/user.service.js";
import UserModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const registerUser = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const user = await userService.registerUser(req.body);
        return res.status(201).json({
          success: true,
          message: "User registered successfully",
          data: user,
        });
    }
    catch(err:any){
        next(err)
    }
}

export const loginUser = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const user = await userService.loginUser(req.body);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: user,
        })
    }
    catch(err:any){
        next(err)
    }
}

export const getCurrentUser = async (req:Request, res:Response, next:NextFunction) =>{
    try{
        const userId = req.user?.sub;
        if(!userId){
            throw new ApiError(401, "Authentication required");
        }
        const user =  await userService.getCurrentUser(userId);
        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: user,
        })
    }
    catch(err:any){
        next(next)
    }
}

export const updateUserProfile = async (req:Request, res:Response, next:NextFunction) =>{
    try{
        const userId = req.user?.sub;
        if(!userId){
            throw new ApiError(401, "Authentication required")
        }
        const user = await userService.updateUserProfile(userId, req.body);
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        })
    }
    catch(err:any){
        next(err)
    }
}

// change password controller
export const changePassword = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const userId = req.user?.sub;
        if(!userId){
            throw new ApiError(401, "Authentication required");
        }
        await userService.changePassword(userId, req.body);
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        })
    }
    catch(err:any){
        next(err)
    }
}

// Logout controller
export const logoutUser = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const userId = req.user?.sub;
        if(!userId){
            throw new ApiError(401, "Authentication required");
        }
        await userService.logoutUser(userId);
        return res.status(200).json({
            success: true,
            message: "Logout successful. Access tokens have been revoked.",
        })
    }
    catch(err:any){
        next(err)
    }
}