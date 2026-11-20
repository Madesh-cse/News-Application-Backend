import mongoose, { Schema, InferSchemaType } from "mongoose";
import { ARTICLE_STATUSES } from "../types/article.types.js";

const articleSchema = new Schema(
  {
    // Article headline
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },

    // SEO-friendly unique URL
    slug: {
      type: String,
      required: [true, "Article slug is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    // Short article summary
    description: {
      type: String,
      required: [true, "Article description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    // Full article content
    content: {
      type: String,
      required: [true, "Article content is required"],
      trim: true
    },

    // Article cover image
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
      trim: true,
      match: [
        /^https?:\/\/.+/i,
        "Cover image must be a valid HTTP or HTTPS URL"
      ]
    },

    // User collection
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Article author is required"]
    },

    // Category collection
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Article category is required"]
    },

    // Source collection
    source: {
      type: Schema.Types.ObjectId,
      ref: "Source",
      default: null
    },

    // Article publication status
    status: {
      type: String,
      enum: {
        values: ARTICLE_STATUSES,
        message: "Invalid article status"
      },
      default: "draft"
    },

    // Article search keywords
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) =>
        tags.map((tag) => tag.trim().toLowerCase())
    },

    // Number of article views
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"]
    },

    // Publication date
    publishedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create a Index for a documents
articleSchema.index({ slug: 1 }, { unique: true });
// News feed: latest published articles
articleSchema.index({
  status: 1,
  publishedAt: -1
});
// Category-based news feed
articleSchema.index({
  category: 1,
  status: 1,
  publishedAt: -1
});
// Author's article management
articleSchema.index({
  author: 1,
  createdAt: -1
});
// Full-text search
articleSchema.index({
  title: "text",
  description: "text",
  content: "text"
});

export type Article = InferSchemaType<typeof articleSchema>
const ArticleModel = mongoose.model("Article", articleSchema);

export default ArticleModel;