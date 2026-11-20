
import mongoose, { Schema, InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must contain at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"]
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"]
    },

    image: {
      type: String,
      default: null,
      trim: true,
      match: [
        /^https?:\/\/.+/i,
        "Image must be a valid HTTP or HTTPS URL"
      ]
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Optimize active category lookups
categorySchema.index({ isActive: 1, name: 1 });
export type Category = InferSchemaType<typeof categorySchema>;
const CategoryModel = mongoose.model("Category",categorySchema);

export default CategoryModel;
