
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// Record an article in reading history
export const createReadingHistorySchema = z
  .object({
    articleId: objectIdSchema,
  })
  .strict();

// Validate article ID from route parameters
export const readingHistoryParamsSchema = z
  .object({
    articleId: objectIdSchema,
  })
  .strict();
  
// Retrieve reading history with pagination
export const readingHistoryQuerySchema = z
  .object({
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
  })
  .strict();
