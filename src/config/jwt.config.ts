import type { SignOptions } from "jsonwebtoken";


const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
if (!accessTokenSecret) {
  throw new Error("JWT_ACCESS_SECRET is not configured");
}

export const jwtConfig = {
  accessSecret: accessTokenSecret,
  accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
};
