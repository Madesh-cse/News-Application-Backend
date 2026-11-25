
import mongoose from "mongoose";

import ReadingHistoryModel from "../models/reading-history.model.js";
import ArticleModel from "../models/article.model.js";
import ApiError from "../utils/ApiError.js";

// Record reading activity
export const recordReadingHistory = async (
  userId: string,
  articleId: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(articleId)
  ) {
    throw new ApiError(400, "Invalid user or article ID");
  }

  // Ensure the article exists and is published
  const article = await ArticleModel.findOne({
    _id: articleId,
    status: "published",
    isDeleted: { $ne: true },
  }).select("_id");

  if (!article) {
    throw new ApiError(404, "Published article not found");
  }

  // Update existing history or create a new entry
  const history = await ReadingHistoryModel.findOneAndUpdate(
    {
      user: userId,
      article: articleId,
    },
    {
      $set: {
        lastReadAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  return history;
};

// Get reading history
export const getReadingHistory = async (
  userId: string,
  page = 1,
  limit = 10,
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
  };

  const [history, totalItems] = await Promise.all([
    ReadingHistoryModel.find(filter)
      .sort({ lastReadAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "article",
        select:
          "title slug description coverImage category source publishedAt",
        populate: [
          {
            path: "category",
            select: "name slug",
          },
          {
            path: "source",
            select: "name",
          },
        ],
      })
      .lean(),

    ReadingHistoryModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    history,
    pagination: {
      totalItems,
      currentPage: page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// Remove one article from reading history
export const removeReadingHistory = async (
  userId: string,
  articleId: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(articleId)
  ) {
    throw new ApiError(400, "Invalid user or article ID");
  }

  const deletedEntry = await ReadingHistoryModel.findOneAndDelete({
    user: userId,
    article: articleId,
  });

  return {
    deleted: Boolean(deletedEntry),
  };
};
// Clear all reading history
export const clearReadingHistory = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const result = await ReadingHistoryModel.deleteMany({
    user: userId,
  });

  return {
    deletedCount: result.deletedCount,
  };
};
