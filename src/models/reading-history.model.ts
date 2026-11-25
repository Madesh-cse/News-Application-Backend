
import mongoose, { Schema, InferSchemaType } from "mongoose";

const readingHistorySchema = new Schema(
  {
    // Reader who viewed the article
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // Article that was read
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Article is required"],
    },

    // Most recent time the reader opened this article
    lastReadAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reading history entries
// for the same user and article.
readingHistorySchema.index(
  { user: 1, article: 1 },
  { unique: true }
);

// Efficiently retrieve a user's latest reading activity.
readingHistorySchema.index({
  user: 1,
  lastReadAt: -1,
});

export type ReadingHistory = InferSchemaType<
  typeof readingHistorySchema
>;

const ReadingHistoryModel = mongoose.model(
  "ReadingHistory",
  readingHistorySchema
);

export default ReadingHistoryModel;
