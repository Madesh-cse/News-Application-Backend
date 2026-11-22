import { Router } from "express";
import { protectedTest,adminTest,editorTest } from "../controllers/test.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/protected", authenticate, protectedTest);
router.get("/admin",authenticate,authorize("admin"),adminTest);
router.get("/editor",authenticate,authorize("admin", "editor"),editorTest);

export default router;