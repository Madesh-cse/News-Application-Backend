
import { Router } from "express";
import {createReadingHistory,getUserReadingHistory, deleteReadingHistory,deleteAllReadingHistory,} from "../controllers/reading-history.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {validateBody,validateParams, validateQuery,} from "../middlewares/validate.middleware.js";
import {createReadingHistorySchema,readingHistoryParamsSchema,readingHistoryQuerySchema,} from "../validators/reading-history.validation.js";

const router = Router();
// All reading history routes require authentication.
router.use(authenticate);
router.post("/",validateBody(createReadingHistorySchema),createReadingHistory,);
router.get("/",validateQuery(readingHistoryQuerySchema),getUserReadingHistory,);
router.delete("/",deleteAllReadingHistory,);
router.delete("/:articleId",validateParams(readingHistoryParamsSchema),deleteReadingHistory,);

export default router;
