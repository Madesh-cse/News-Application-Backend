
import { Router } from "express";

import { getAllSources } from "../controllers/source.controller.js";

const router = Router();

router.get("/", getAllSources);

export default router;
