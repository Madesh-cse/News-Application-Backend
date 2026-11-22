import { Router } from "express";
import { createArticle,getArticle,getLatestArticles,getArticlesByCategory, getArticleById, getArticleBySlug, updateArticle,deleteArticle,searchArticles,getTrendingArticles,getFeaturedArticles, } from "../controllers/article.controller.js";
import {createArticleSchema,updateArticleSchema,searchArticleQuerySchema,articleFilterQuerySchema  } from "../validators/article.validator.js";
import {articleIdParamsSchema, categoryIdParamsSchema,articleSlugParamsSchema,} from "../validators/common.validator.js";
import {validateBody,validateParams,validateQuery} from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";


const router = Router();

// Read routes
router.get("/", validateQuery(articleFilterQuerySchema), getArticle);
router.get("/search", validateQuery(searchArticleQuerySchema), searchArticles);
router.get("/latest", getLatestArticles);
router.get("/trending", getTrendingArticles);
router.get("/featured", getFeaturedArticles);
router.get("/category/:categoryId",validateParams(categoryIdParamsSchema), getArticlesByCategory);
router.get("/slug/:slug", validateParams(articleSlugParamsSchema), getArticleBySlug);
router.get("/:id", validateParams(articleIdParamsSchema), getArticleById);

// Create and update, delete routes
router.post("/", authenticate, authorize("admin", "editor"),validateBody(createArticleSchema), createArticle);
router.patch("/:id", authenticate, authorize("admin", "editor"), validateParams(articleIdParamsSchema),validateBody(updateArticleSchema),updateArticle);
router.delete("/:id",  authenticate,authorize("admin", "editor"), validateParams(articleIdParamsSchema), deleteArticle);

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