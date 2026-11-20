
import type { GNewsCategory } from "../types/newsApi.types.js";

export const mapGNewsCategory = (category: GNewsCategory): string => {
  const categoryMap: Record<GNewsCategory, string> = {
    general: "world",
    world: "world",
    nation: "india",
    business: "business",
    technology: "technology",
    entertainment: "entertainment",
    sports: "sports",
    science: "science",
    health: "health",
  };

  return categoryMap[category];
};
