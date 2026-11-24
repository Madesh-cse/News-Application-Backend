
import CategoryModel from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";

class CategoryService {
  async getAllCategories() {
    return CategoryModel.find({
      isActive: true,
    })
      .select("_id name slug description image")
      .sort({ name: 1 })
      .lean();
  }

  async getCategoryBySlug(slug: string) {
    const category = await CategoryModel.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    })
      .select("_id name slug description image")
      .lean();

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return category;
  }
}

const categoryService = new CategoryService();

export default categoryService;
