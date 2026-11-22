import type { AccessTokenPayload } from "../utils/jwt.util.js";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload & {
        sub: string;
        iat: number;
        exp: number;
      };
    }
  }
}

export {};