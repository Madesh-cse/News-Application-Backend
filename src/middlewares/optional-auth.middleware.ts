
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.util.js";
import ApiError from "../utils/ApiError.js";
import UserModel from "../models/user.model.js";

export const optionalAuthenticate: RequestHandler = async (req, res,next) => {
  try {
    const authHeader = req.headers.authorization;
    // No token means the visitor is a guest.
    if (!authHeader) {
      return next();
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Invalid authorization header");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Access token is required");
    }
    const decoded = verifyAccessToken(token);
    const user = await UserModel.findById(decoded.sub)
      .select("tokenVersion status");

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Your account is blocked");
    }

    const currentTokenVersion = user.tokenVersion ?? 0;

    if (decoded.tokenVersion !== currentTokenVersion) {
      throw new ApiError(401, "Access token has been revoked");
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      return next(new ApiError(401, "Invalid or expired access token"));
    }

    next(error);
  }
};
