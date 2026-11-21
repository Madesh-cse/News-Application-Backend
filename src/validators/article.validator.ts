import { z } from "zod"

//  Validate the mongoDB objectId
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// Validate the image URL
const imageUrlSchema = z.string().url("Invalid image url").refine((value)=> /^https?:\/\//i.test(value), "Image URL must use HTTP or HTTPS");

// validate the article field
const articleFiled = {
    title: z.string().trim() .min(1, "Article title is required").max(200, "Title cannot exceed 200 characters"),
    description:z .string()
    .trim()
    .min(1, "Article description is required")
    .max(500, "Description cannot exceed 500 characters"),
    content: z.string().nullable().optional(),
    coverImage: imageUrlSchema.nullable().optional(),
    category: objectIdSchema,
    source: objectIdSchema.optional(),
    tags: z
    .array(z.string().trim().min(1))
    .max(20, "Maximum 20 tags are allowed")
    .optional(),
     status: z
    .enum(["draft", "published", "archived"])
    .optional(),
}

export const createArticleSchema = z.object(articleFiled)
  .strict();

// create a validation
export const updateArticleSchema = z.object({
    ...articleFiled,
    category: objectIdSchema.optional(),
    source: objectIdSchema.optional(),
})
.partial()
.strict()
.refine((data)=> Object.keys(data).length > 0, "At least one field is required for update")
