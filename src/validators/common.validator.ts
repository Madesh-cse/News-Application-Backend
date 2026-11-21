import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const articleIdParamsSchema = z.object({id: objectIdSchema,});
export const categoryIdParamsSchema = z.object({categoryId: objectIdSchema,});
export const articleSlugParamsSchema = z.object({slug: z.string().min(1, "Article slug is required"),});