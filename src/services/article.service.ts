import mongoose from "mongoose";

import ArticleModel from "../models/article.model.js";
import CategoryModel from "../models/category.model.js";
import SourceModel from "../models/source.model.js";

import { generateSlug } from "../utils/slug.util.js";
import ApiError from "../utils/ApiError.js";


interface CreateArticleInput{
  title: string;
  description: string;
  content?: string | null;
  coverImage?: string | null;
  category: string;
  source?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
}

// Escape special regex characters to prevent unintended patterns
const escapeRegex = (value: string): string =>{
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ArticleDiscoveryFilters{
    category?: string,
    source: string,
    q?: string,
    from?: string;
    to?: string;
    sort?: "newest" | "oldest" | "popular" | "leastPopular";
    page: number;
    limit: number;
}

class ArticleService{
    async createArticle(data:CreateArticleInput){
        const { title,description,content,coverImage,category,source,tags,status,} = data;
        // Valid the category objectId
        if(!mongoose.isValidObjectId(category)){
            throw new ApiError(400, "Invalid Category Id");
        }
        // Verify category exists and is active
        const categoryExist = await CategoryModel.exists({
            _id: category,
            isActive: true
        })
        if(!categoryExist){
            throw new ApiError(404, "Category not found or inactive");
        }
        // Valid the source if available
        if(source){
            if(!mongoose.isValidObjectId(source)){
                 throw new ApiError(400, "Invalid sourceId");
            }
            const sourceExist = await SourceModel.exists({
                _id: source,
                isActive: true
            })
            if(!sourceExist){
                throw new ApiError(404, "Source not found or inactive");
            }
        }

        // Generate a Slug
        const baseslug = generateSlug(title);
        if(!baseslug){
            throw new ApiError(422, "Unable to generate a slug");
        }
        let slug = baseslug;
        let counter =  2;
        while(await ArticleModel.exists({slug})){
            slug =  `${baseslug} - ${counter}`;
            counter++;
        }

        // create a article
        const article = await ArticleModel.create({
            title,
            slug,
            description,
            content: content ?? null,
            coverImage: coverImage ?? null,
            category,
            source: source ?? null,
            tags: tags ?? [],
            status: status === "archived" ? "archieve" : status ?? "draft",
            isExternal: false,
        });
        return ArticleModel.findById(article._id)
          .populate("category")
          .populate("source");

    }

    // Get the all article
    async getallArticle(){
        return ArticleModel.find({
            isDeleted: { $ne: true },
        })
         .populate("category", "name slug")
         .populate("source", "name websiteUrl")
         .sort({createdAt:-1})
    }
    // By id
    async getarticleById(id: string){
        if(!mongoose.isValidObjectId(id)){
           throw new ApiError(400, "Invalid article ID");
        }
        const article = await ArticleModel.findOne({
            _id: id,
           isDeleted: { $ne: true },
        })
          .populate("category", "name slug")
          .populate("source", "name websiteUrl")

          if(!article){
            throw new ApiError(404, "Article not found");
          }
        return article;
    }
    // Get by Slug
    async getBySlug(slug: string){
        const article = await ArticleModel.findOne({slug,isDeleted: { $ne: true },})
         .populate("category", "name slug")
         .populate("source", "name websiteUrl");
        if(!article){
           throw new ApiError(404, "Slug is not found");
        }
        return article;
    }
    // Get the latest article
    async getLatestArticle(limit =  10){
        return await ArticleModel.find({status: "published",isDeleted: { $ne: true },})
         .populate("category", "name slug")
         .populate("source", "name websiteUrl")
         .sort({ publishedAt: -1})
        .limit(limit);
    }
    // Get Category By Id
    async getArticleByCategory(categoryId: string){
        if(!mongoose.isValidObjectId(categoryId)){
            throw new ApiError(400, "Invalid categoryId");
        }
        const categoryExist = await CategoryModel.exists({
            _id: categoryId,
            isActive: true
        })
        if(!categoryExist){
           throw new ApiError(404, "Category not found");
        }

        return ArticleModel.find({
            category: categoryId,
            isDeleted: { $ne: true },
        })
        .populate("category", "name slug")
        .populate("source", "name websiteUrl")
        .sort({ publishedAt: -1 })
    }

    // Update a Article
    async updateArticle(id: string, data: Record<string, unknown>){
        if(!mongoose.isValidObjectId(id)){
            throw new ApiError(400, "Invalid article ID");
        }
        const existingArticle = await ArticleModel.findById(id);
        if(!existingArticle){
            throw new ApiError(404, "Article not found");
        }

        // Allow only editable field
        const allowedFields = [
           "title",
           "description",
           "content",
           "coverImage",
           "category",
           "source",
           "tags",
           "status",
        ];
        const recievedField = Object.keys(data);
        if(recievedField.length === 0){
            throw new ApiError(422,"At least one field is required for update");
        }
        const invalidField = recievedField.filter((field)=> !allowedFields.includes(field));
        if(invalidField.length > 0){
            throw new ApiError(400,`Unsupported update fields: ${invalidField.join(", ")}`);
        }
        const updates: Record<string, unknown> = {};
        // Valid title and generate the slug
        if("title" in data){
            if(typeof data.title !== "string" || !data.title.trim()){
                throw new Error("Article title cannot be empty")
            }
            const title = data.title.trim();
            const baseSlug = generateSlug(title);
            if(!baseSlug){
                throw new ApiError(422, "Article title cannot be empty");
            }
            let slug = baseSlug;
            let counter = 2;
            while(await ArticleModel.exists({
                slug,
                _id: { $ne: existingArticle._id},
            })){
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            updates.title = title;
            updates.slug = slug;
        }
        if("description" in data){
            if(typeof data.description !== "string" || !data.description.trim()){
                throw new ApiError(422,"Article description cannot be empty");
            }
            updates.description = data.description.trim();
        }
        if("content" in data){
            if(data.content !== null && typeof data.content !== "string"){
                throw new ApiError(422,"Article content must be a string or null");
            }
            updates.content = typeof data.content === "string" ? data.content.trim() || null : null;
        }
        if("coverImage" in data){
            if(data.coverImage !== null && typeof data.coverImage !== "string"){
                throw new Error("Cover image must be URL or null")
            }

            if(typeof data.coverImage === "string"){
                try{
                    const imageUrl = new URL(data.coverImage);
                    if(!["http:", "https:"].includes(imageUrl.protocol)){
                        throw new Error()
                    }
                }
                catch{
                    throw new Error("Invalid  cover image url")
                }
                updates.coverImage = data.coverImage;
            }
            else{
                updates.coverImage = null;
            }
        }
        // Verify category if supplied
        if ("category" in data){
            if( typeof data.category !== "string" || !mongoose.isValidObjectId(data.category) ){
                throw new Error("Invalid category ID");
            }

            const categoryExists = await CategoryModel.exists({
                _id: data.category,
                isActive: true,
            })
            if(!categoryExists){
                throw new Error("Category not found or inactive")
            }
            updates.category = data.category
        }
        // Verify source if supplied
        if ("source" in data){
            if (data.source === null){
                updates.source = null;
            }
            else{
                if(typeof data.source !== "string" ||  !mongoose.isValidObjectId(data.source)){
                    throw new Error("Invalid source Id")
                }
                const sourceExists =  await SourceModel.exists({
                    _id: data.source,
                    isActive: true,
                })
                if(!sourceExists){
                    throw new Error("Source not found or inactive")
                }
                updates.source = data.source;
            }
        }

        // Validate tage
        if("tags" in data){
            if( !Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === "string")){
                throw new Error("Tags must be an array of strings");
            }
            updates.tags = data.tags.map((tag: string) => tag.trim());
        }

        // Validate status
        if ("status" in data){
            const allowedStatuses = ["draft", "published", "archived"];
            if( typeof data.status !== "string" || !allowedStatuses.includes(data.status) ){
                throw new Error("Invalid article status");
            }
            updates.status = data.status;
            if(data.status === "published" && existingArticle.status !== "published" &&  !existingArticle.publishedAt){
                updates.publishedAt = new Date();
            }
        }

        // 13. Update article and return populated result
        const updatedArticle = await ArticleModel.findByIdAndUpdate(
            id, { $set: updates},
            {
                returnDocument: "after",
                runValidators: true,
            }
        )
        .populate("category", "name slug")
        .populate("source", "name websiteUrl");
        if(!updatedArticle){
            throw new Error("Article not found")
        }
        return updatedArticle;
    }

    // Delete Service
    async deleteArticle(id: string){
        if(!mongoose.isValidObjectId(id)){
            throw new Error("Invalid article ID")
        }
        // Soft delete the article
        const deletedArticle = await ArticleModel.findOneAndUpdate(
            {
                _id: id,
                isDeleted: { $ne: true},
            },
            {
                $set:{
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        // Check whether the article exists
        if(!deletedArticle){
            throw new Error("Article not found");
        }

        return deletedArticle;
    }

    // search article by title and description
    async searchArticles(query: string){
        const searchTerm = escapeRegex(query.trim());
        return ArticleModel.find({
            status: "published",
            isDeleted: { $ne: true},
            $or:[
                {
                    title:{
                        $regex: searchTerm,
                        $options: "i"
                    },
                    description:{
                        $regex: searchTerm,
                        $options: "i"
                    },
                },
            ],
        })
        .populate("category", "name slug")
        .populate("source", "name websiteUrl")
        .sort({ publishedAt: -1 })
        .limit(20);
    }

    // Filter services
    async getArticlesByFilters(filters: ArticleDiscoveryFilters){
        const { category, source, q, from , to, sort, page, limit} = filters;
        // Base query: published and non-deleted articles
        const query: Record<string, any> = {
            status: "published",
            isDeleted: { $ne: true },
        }
        // Validate and category filter
        if(category){
            if(!mongoose.isValidObjectId(category)){
                throw new ApiError(400, "Invalid category ID");
            }
            const categoryExists = await CategoryModel.exists({
                _id: category,
                isActive: true
            });
            if(!categoryExists){
                throw new ApiError(404, "Category not found or inactive");
            }
            query.category = category;
        }
        // Validate and apply source filter
        if(source){
            if (!mongoose.isValidObjectId(source)) {
                throw new ApiError(400, "Invalid source ID");
            }
            const sourceExists = await SourceModel.exists({
                _id: source,
                isActive: true
            })
            if(!sourceExists){
                 throw new ApiError(404, "Source not found or inactive");
            }
            query.source = source;
        }

        // Apply keyword search to title and description
        if(q){
            const searchTerm = escapeRegex(q.trim());
                query.$or = [
                {
                    title: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
            ];
        }
        if(from || to){
            const publishedAtFilter: Record<string, Date> = {};
            if(from){
                publishedAtFilter.$gte = new Date(
                    `${from}T00:00:00.000Z`
                );
            }
            if(to){
                const endDate = new Date(`${to}T00:00:00.000Z`);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                publishedAtFilter.$lt = endDate;
            }
            query.publishedAt = publishedAtFilter;
        }
        //pagination
        const skip = ( page - 1) * limit
        // Apply sorting
        const sortOptions: Record<string, 1 | -1> = {
            newest: -1,
            oldest: 1,
            popular: -1,
            leastPopular: 1,
        };

        const sortField = sort === "popular" || sort === "leastPopular" ? "viewCount" : "publishedAt";
        const sortOrder = sortOptions[sort ?? "newest"];
        const[articles, totalArticles] = await Promise.all([
            ArticleModel.find(query)
              .populate("category", "name slug")
              .populate("source", "name websiteUrl")
              .sort({[sortField]: sortOrder, _id: -1 })
              .limit(20),
            ArticleModel.countDocuments(query)
        ])
        const totalPages = Math.ceil(totalArticles / limit);
        return{
            articles,
            pagination:{
                totalArticles,
                currentPage: page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        }
    }

    // Trending Articles
    async getTrendingArticles() {
        return ArticleModel.find({
            status:"published",
            isDeleted: { $ne: true}
        })
        .populate("category", "name slug")
        .populate("source", "name websiteUrl")
        .sort({ viewCount: -1,publishedAt: -1, }).limit(10)
    }

    // feature Articles
    async getFeaturedArticles(){
        return ArticleModel.find({
            status: "published",
            isDeleted: { $ne: true },
            isFeatured: true,
        })
        .populate("category", "name slug")
        .populate("source", "name websiteUrl")
        .sort({publishedAt: -1,}).limit(10);
    }

    // Increment article view count service
    async incrementArticleView(id: string){
        if(!mongoose.isValidObjectId(id)){
            throw new ApiError(400, "Invalid article ID")
        }
        const article = await ArticleModel.findOneAndUpdate(
            {
              _id: id,
              status: "published",
              isDeleted: { $ne: true },
            },
            {
                $inc:{
                    viewCount: 1,
                },
            },
            {
                returnDocument: "after",
            }
        );
        if(!article){
            throw new ApiError(404, "Published article not found");
        }

        return {
            articleId: article._id,
            viewCount: article.viewCount,
        }
    }
}

const articleService = new ArticleService();
export default articleService;