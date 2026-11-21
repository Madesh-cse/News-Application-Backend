import type { Request ,Response, NextFunction, } from "express";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export const errorMiddleware = (error: unknown,req: Request,res: Response,next: NextFunction) => {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  // 1. Custom application errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  }

  // 2. MongoDB duplicate key error
  else if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  // 3. Mongoose validation error
  else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = "Database validation failed";
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  // 4. Mongoose CastError
  else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  // 5. Log unexpected errors
  if (statusCode === 500) {
    console.error("Unexpected server error:", error);
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (details !== undefined) {
    response.errors = details;
  }

  if (process.env.NODE_ENV === "development" && statusCode === 500) {
    response.stack =
      error instanceof Error ? error.stack : undefined;
  }

  return res.status(statusCode).json(response);
};