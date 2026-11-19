
import mongoose, { Schema, InferSchemaType } from "mongoose";

const sourceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Source name is required"],
      trim: true,
      minlength: [2, "Source name must contain at least 2 characters"],
      maxlength: [100, "Source name cannot exceed 100 characters"]
    },

    providerId: {
      type: String,
      trim: true,
      default: null
    },

    websiteUrl: {
      type: String,
      required: [true, "Source website URL is required"],
      trim: true,
      match: [
        /^https?:\/\/.+/i,
        "Please provide a valid HTTP or HTTPS URL"
      ]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: ""
    },

    logo: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^https?:\/\/.+/i,
        "Logo must be a valid HTTP or HTTPS URL"
      ]
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate external provider IDs when one is supplied.
sourceSchema.index(
  { providerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerId: { $type: "string" }
    }
  }
);

// Support active-source listing.
sourceSchema.index({ isActive: 1, name: 1 });

export type Source = InferSchemaType<typeof sourceSchema>;

const SourceModel = mongoose.model("Source", sourceSchema);

export default SourceModel;
