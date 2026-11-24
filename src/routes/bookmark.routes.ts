
import { Router } from "express";
import {addBookmark, removeBookmark,getUserBookmarks,getBookmarkStatus,} from "../controllers/bookmark.controller.js";
import {bookmarkArticleIdParamsSchema, bookmarkQuerySchema,} from "../validators/bookmark.validator.js";
import {validateParams,validateQuery,} from "../middlewares/validate.middleware.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/",validateQuery(bookmarkQuerySchema),getUserBookmarks);
router.get("/:articleId/status",validateParams(bookmarkArticleIdParamsSchema),getBookmarkStatus);
router.post("/:articleId",validateParams(bookmarkArticleIdParamsSchema), addBookmark);
router.delete("/:articleId",validateParams(bookmarkArticleIdParamsSchema),removeBookmark);

export default router;
