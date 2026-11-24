
import type { Request, Response, NextFunction } from "express";
import categoryService from "../services/category.service.js";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slug =
      typeof req.params.slug === "string"
        ? req.params.slug
        : req.params.slug[0];

    const category = await categoryService.getCategoryBySlug(slug);

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
