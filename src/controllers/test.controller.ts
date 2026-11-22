import type { RequestHandler } from "express";

export const protectedTest: RequestHandler = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authentication successful",
    data: {
      userId: req.user?.sub,
      role: req.user?.role,
    },
  });
};

export const adminTest: RequestHandler = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
};

export const editorTest: RequestHandler = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Editor access granted",
  });
};