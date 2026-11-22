import jwt, { type SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config.js";

export interface AccessTokenPayload{
    role: "admin" | "editor" | "reader"
}

export const generateAcessToken = (userId: string, role: AccessTokenPayload["role"]): string=>{
    const options : SignOptions = {
        subject: userId,
        expiresIn: jwtConfig.accessExpiresIn,
        algorithm: "HS256"
    };
    return jwt.sign(
        { role},
        jwtConfig.accessSecret,
        options
    )
}

export const verifyAccessToken = (token: string): AccessTokenPayload & { sub: string, iat: number, exp:number}=>{
    const decoded = jwt.verify(token, jwtConfig.accessSecret, {
        algorithms: ["HS256"]
    })
    if (typeof decoded === "string" ||typeof decoded.sub !== "string" ||!["admin", "editor", "reader"].includes(String(decoded.role))) {
       throw new Error("Invalid access token payload");
    }
    return decoded as AccessTokenPayload & {
        sub: string;
        iat: number;
        exp: number;
    };
}