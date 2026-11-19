
import mongoose, { Schema, InferSchemaType } from "mongoose";

import {  USER_ROLES,USER_STATUSES } from "../types/user.types.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ]
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false
    },

    profileImage: {
      type: String,
      default: null,
      trim: true,
      match: [
        /^https?:\/\/.+/i,
        "Profile image must be a valid HTTP or HTTPS URL"
      ]
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "reader"
    },

    status: {
      type: String,
      enum: USER_STATUSES,
      default: "active"
    }
  },
  {
    timestamps: true
  }
);
export type User = InferSchemaType<typeof userSchema>;
const UserModel = mongoose.model("User", userSchema);

export default UserModel;
