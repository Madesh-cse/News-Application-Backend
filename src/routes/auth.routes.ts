import { Router } from "express";

import { registerUser, loginUser,getCurrentUser,updateUserProfile,changePassword,logoutUser, } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registerUserSchema,loginUserSchema,updateUserProfileSchema,changePasswordSchema } from "../validators/user.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getCurrentUser);
router.post("/register", validateBody(registerUserSchema),registerUser);
router.post("/login",validateBody(loginUserSchema),loginUser);
router.patch("/me",authenticate,validateBody(updateUserProfileSchema),updateUserProfile);
router.patch("/change-password",authenticate,validateBody(changePasswordSchema),changePassword);
router.post("/logout", authenticate, logoutUser);

export default router;