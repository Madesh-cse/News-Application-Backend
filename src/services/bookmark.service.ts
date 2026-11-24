import mongoose from "mongoose";

import BookmarkModel from "../models/bookmark.model.js";
import ArticleModel from "../models/article.model.js";
import ApiError from "../utils/ApiError.js";
import { nextTick } from "node:process";

class BookmarkService{
    // Add an article to the user's bookmarks
    async addBookmark(userId:string, articleId: string){
        if(!mongoose.isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user ID")
        }
        if(!mongoose.isValidObjectId(articleId)){
            throw new ApiError(400, "Invalid article ID")
        }
        // Verify that the article exists, is published, and is not deleted
        const articleExists = await  ArticleModel.exists({
            _id: articleId,
            status: "published",
            isDeleted: { $ne: true },
        })
        if(!articleExists){
            throw new ApiError(404, "Published article not found");
        }
        // check wheather the article is already bookmark
        const existingBookmark = await BookmarkModel.findOne({
            user: userId,
            articleId: articleId
        })
        if(existingBookmark){
            throw new ApiError(409, "Article is already bookmarked");
        }

        // Create a Bookmark
        try{
            const bookmark = await BookmarkModel.create({
                user: userId,
                article: articleId
            })
            return bookmark;
        }
        catch(error:any){
            if (error.code === 11000){
                throw new ApiError(409, "Article is already bookmarked");
            }
            throw error
        }
    }

    //  Remove an article from bookmarks
    async removeBookmark(userId: string, articleId: string){
        if(!mongoose.isValidObjectId){
            throw new ApiError(400, "Invalid user ID");
        }
        if(!mongoose.isValidObjectId){
            throw new ApiError(400, "Invalid article ID");
        }
        const bookmark = await BookmarkModel.findOneAndDelete({
            user: userId,
            article: articleId,
        })
        if(!bookmark){
            throw new ApiError(404, "Bookmark not found");
        }
        return bookmark;
    }

    // Get all bookmarks belonging to a user
    async getUserBookmarks(userId: string, page = 1, limit = 10){
        if(!mongoose.isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user ID");
        }
        const skip = (page - 1) * limit;
        const bookmarkFilter = {
            user: userId,
        }
        const [bookmarks, totalBookmarks] = await Promise.all([
            BookmarkModel.find(bookmarkFilter).populate({
                path: "article",
                match:{
                    status: "published",
                    isDeleted: { $ne: true },
                },
                select:"title slug description coverImage publishedAt viewCount category source author",
                populate:[
                    {
                        path: "category",
                        select: "name slug",
                    },
                    {
                        path: "source",
                        select: "name websiteUrl",
                    },
                    {
                        path: "author",
                        select: "name profileImage",
                    }
                ],
            })
            .sort({ createdAt: -1})
            .skip(skip)
            .limit(limit),
            BookmarkModel.countDocuments(bookmarkFilter),
        ]);
        // Exclude bookmarks whose articles were deleted or unpublished
        const validBookmarks = bookmarks.filter((bookmark) => bookmark.article !== null);
        const totalPages = Math.ceil(totalBookmarks / limit);
        return{
            bookmarks: validBookmarks,
            pagination:{
                totalBookmarks,
                currentPage: page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        }
    }

    // Check whether a particular article is bookmarked
    async getBookmarkStatus(userId: string, articleId: string){
        if (!mongoose.isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user ID");
        }
        if (!mongoose.isValidObjectId(articleId)){
            throw new ApiError(400, "Invalid article ID");
        }
        const bookmark = await BookmarkModel.exists({
            user: userId,
            article: articleId,
        });
        return{
            isBookmarked: Boolean(bookmark),
        }
    }
}
const bookmarkService = new BookmarkService();

export default bookmarkService;