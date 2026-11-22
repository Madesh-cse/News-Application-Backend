import type { HydratedDocument } from "mongoose";
import type { User } from "../models/user.model.js";

export const toSafeUser = (user: HydratedDocument<User>) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};