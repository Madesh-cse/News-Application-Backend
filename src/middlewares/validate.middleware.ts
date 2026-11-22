import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import ApiError from "../utils/ApiError.js";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new ApiError(
          422,
          "Request validation failed",
          result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }
    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(
        new ApiError(
          400,
          "Invalid route parameters",
          result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }

    Object.assign(req.params, result.data);
    next();
  };
};


export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(
        new ApiError(
          422,
          "Query validation failed",
          result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }

    res.locals.validatedQuery = result.data;
    next();
  };
};
