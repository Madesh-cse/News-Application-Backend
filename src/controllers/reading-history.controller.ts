
import type { Request, Response, NextFunction } from "express";

import ApiError from "../utils/ApiError.js";

import {
  recordReadingHistory,
  getReadingHistory,
  removeReadingHistory,
  clearReadingHistory,
} from "../services/reading-history.service.js";


const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user?.sub) {
    throw new ApiError(401, "Authentication required");
  }

  return req.user.sub;
};

export const createReadingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { articleId } = req.body;

    const history = await recordReadingHistory(
      userId,
      articleId,
    );

    res.status(200).json({
      success: true,
      message: "Reading history recorded successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReadingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const { page, limit } = res.locals.validatedQuery;

    const result = await getReadingHistory(
      userId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      message: "Reading history retrieved successfully",
      data: result.history,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteReadingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const articleIdParam = req.params.articleId;
    const articleId = Array.isArray(articleIdParam)
      ? articleIdParam[0]
      : articleIdParam;

    if (!articleId) {
      throw new ApiError(400, "Article ID is required");
    }

    const result = await removeReadingHistory(
      userId,
      articleId,
    );

    if (!result.deleted) {
      res.status(404).json({
        success: false,
        message: "Reading history entry not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Reading history entry removed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAllReadingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const result = await clearReadingHistory(userId);

    res.status(200).json({
      success: true,
      message: "Reading history cleared successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
