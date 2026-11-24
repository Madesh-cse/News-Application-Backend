
import mongoose, { Schema, InferSchemaType } from "mongoose";

const bookmarkSchema = new Schema(
  {
    // User who saved the article
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    // Article saved by the user
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Article ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// A user can bookmark an article only once.
bookmarkSchema.index(
  { user: 1, article: 1 },
  { unique: true }
);

// Efficiently retrieve a user's saved articles, newest first.
bookmarkSchema.index({ user: 1, createdAt: -1 });

export type Bookmark = InferSchemaType<typeof bookmarkSchema>;

const BookmarkModel = mongoose.model("Bookmark", bookmarkSchema);

export default BookmarkModel;
