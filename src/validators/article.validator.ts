import { z } from "zod"

//  Validate the mongoDB objectId
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
// Validate the image URL
const imageUrlSchema = z.string().url("Invalid image url").refine((value)=> /^https?:\/\//i.test(value), "Image URL must use HTTP or HTTPS");
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/,
        "Date must use YYYY-MM-DD format").refine((value)=>{
            const date = new Date(`${value}T00:00:00.000Z`);
            return( !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value)
        }, "Invalid calendar date");

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

// create a seach keyword validation
export const searchArticleQuerySchema = z.object({
    q:z
    .string()
    .trim()
    .min(2, "Search query must contain at least 2 characters")
    .max(100, "Search query cannot exceed 100 characters")
}).strict()

// create a filter validatiion
export const articleFilterQuerySchema = z.object({
    category: objectIdSchema.optional(),
    source: objectIdSchema.optional(),
    q: z.string()
    .trim()
    .min(2, "Search query must contain at least 2 characters")
    .max(100, "Search query cannot exceed 100 characters")
    .optional(),
    from: dateOnlySchema.optional(),
    to: dateOnlySchema.optional(),
    sort: z
    .enum(["newest", "oldest", "popular", "leastPopular"])
    .optional(),
    page: z.coerce.number()
    .int()
    .min(1, "Page must be at least 1")
    .default(1),
    limit: z.coerce.number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
}).strict().refine((data)=>{
    if(data.from && data.to){
        return data.from <= data.to
    }
    return true
},{
    message: "From date cannot be later than to date",
    path: ["from"],
})