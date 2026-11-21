import { Router } from "express";
import { createArticle,getArticle,getLatestArticles,getArticlesByCategory, getArticleById, getArticleBySlug, updateArticle,deleteArticle, } from "../controllers/article.controller.js";
import {createArticleSchema,updateArticleSchema,} from "../validators/article.validator.js";
import {articleIdParamsSchema, categoryIdParamsSchema,articleSlugParamsSchema,} from "../validators/common.validator.js";
import {validateBody,validateParams,} from "../middlewares/validate.middleware.js";


const router = Router();

// Read routes
router.get("/", getArticle);
router.get("/latest", getLatestArticles);
router.get("/category/:categoryId",validateParams(categoryIdParamsSchema), getArticlesByCategory);
router.get("/slug/:slug", validateParams(articleSlugParamsSchema), getArticleBySlug);
router.get("/:id", validateParams(articleIdParamsSchema), getArticleById);

// Create and update, delete routes
router.post("/",validateBody(createArticleSchema), createArticle);
router.patch("/:id", validateParams(articleIdParamsSchema),validateBody(updateArticleSchema),updateArticle);
router.delete("/:id", validateParams(articleIdParamsSchema), deleteArticle);

export default router;

//  Request
//    |
//    v
// Validation Middleware
//    |
//    v
// Controller
//    |
//    v
// Service
//    |
//    v
// MongoDB
//    |
//    v
// Response