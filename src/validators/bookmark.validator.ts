
import { z } from "zod";

// Validate article ID in route parameters
export const bookmarkArticleIdParamsSchema = z.object({
  articleId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid article ID"
  ),
});

// Validate pagination query parameters
export const bookmarkQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
});
