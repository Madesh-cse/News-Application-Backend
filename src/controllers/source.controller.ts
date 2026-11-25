
import type { Request, Response, NextFunction } from "express";
import sourceService from "../services/source.service.js";

export const getAllSources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sources = await sourceService.getAllSources();

    return res.status(200).json({
      success: true,
      count: sources.length,
      data: sources,
    });
  } catch (error) {
    next(error);
  }
};
