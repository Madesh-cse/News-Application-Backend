
import type { Request, Response, NextFunction } from "express";
import bookmarkService from "../services/bookmark.service.js";

// Add bookmark
export const addBookmark = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const articleId = typeof req.params.articleId === "string" ? req.params.articleId : req.params.articleId[0];
    const bookmark = await bookmarkService.addBookmark(userId,articleId);
    return res.status(201).json({
      success: true,
      message: "Article bookmarked successfully",
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

// Remove bookmark
export const removeBookmark = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const articleId = typeof req.params.articleId === "string"? req.params.articleId: req.params.articleId[0];
    await bookmarkService.removeBookmark(userId, articleId);
    return res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all saved articles
export const getUserBookmarks = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const { page, limit } = res.locals.validatedQuery;
    const result = await bookmarkService.getUserBookmarks(userId,page,limit);
    return res.status(200).json({
      success: true,
      count: result.bookmarks.length,
      data: result.bookmarks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Check bookmark status
export const getBookmarkStatus = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const articleId =typeof req.params.articleId === "string"? req.params.articleId: req.params.articleId[0];
    const result = await bookmarkService.getBookmarkStatus(userId,articleId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
