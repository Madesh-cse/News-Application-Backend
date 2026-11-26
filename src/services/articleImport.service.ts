import ArticleModel from "../models/article.model.js";
import CategoryModel from "../models/category.model.js";
import SourceModel from "../models/source.model.js";

import type { NormalizedNewsArticle } from "../types/normalizedArticle.types.js";

import { mapGNewsCategory } from "../utils/newsCategoryMapper.js";
import type { GNewsCategory } from "../types/newsApi.types.js";
import regionalNewsClassifierService from "./regionalNewsClassifier.service.js";

class ArticleImportService {
  private async findOrCreateSource(article: NormalizedNewsArticle) {
    const { source } = article;

    let existingSource = null;

    if (source.providerId) {
      existingSource = await SourceModel.findOne({
        providerId: source.providerId,
      });
    }

    if (!existingSource) {
      existingSource = await SourceModel.findOne({
        name: source.name,
      });
    }

    if (existingSource) {
      return existingSource;
    }

    return SourceModel.create({
      name: source.name,
      providerId: source.providerId,
      websiteUrl: source.websiteUrl,
      description: `External news publisher: ${source.name}`,
      isActive: true,
    });
  }

  // Generate a URL-friendly slug
  private generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return slug || "external-news";
  }

  // Generate a stable unique slug for each provider article
  private generateUniqueSlug(article: NormalizedNewsArticle): string {
    const baseSlug = this.generateSlug(article.title);

    const uniqueIdentifier =
      article.providerArticleId ||
      Buffer.from(article.articleUrl).toString("base64url").slice(0, 12);

    return `${baseSlug}-${uniqueIdentifier}`;
  }

  async importArticle(article: NormalizedNewsArticle,category: GNewsCategory, options?: {region?: "tamil-nadu" | "india" | "international";},
  ) {
    const source = await this.findOrCreateSource(article);
    const categorySlug = mapGNewsCategory(category);
    const categoryDocument = await CategoryModel.findOne({
      slug: categorySlug,
      isActive: true,
    });

    if (!categoryDocument) {
      throw new Error(`Category '${categorySlug}' not found or inactive`);
    }

    const identityFilter = article.providerArticleId
      ? {
          provider: article.provider,
          providerArticleId: article.providerArticleId,
        }
      : {
          provider: article.provider,
          articleUrl: article.articleUrl,
        };

    const slug = this.generateUniqueSlug(article);
    const language = article.language === "ta" || article.language === "en" ? article.language: null;

    const updateOperation: {
      $setOnInsert: Record<string, unknown>;
      $set?: Record<string, unknown>;
    } = {
      $setOnInsert: {
        title: article.title,
        slug,
        description: (article.description ?? "").slice(0, 500),
        content: article.content ?? "",
        coverImage: article.coverImage,
        articleUrl: article.articleUrl,
        provider: article.provider,
        providerArticleId: article.providerArticleId,
        isExternal: true,
        author: null,
        category: categoryDocument._id,
        source: source._id,
        status: "published",
        tags: [],
        viewCount: 0,
        publishedAt: article.publishedAt,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      $set:{
        language
      }
    };

    // Apply regional classification only to regional imports.
    if (options?.region === "tamil-nadu") {
      const classification =
        regionalNewsClassifierService.classifyArticle(article);

      updateOperation.$set = {
        ...updateOperation.$set,
        region: options.region,
        regionalTopic: classification.regionalTopic,
        importanceScore: classification.importanceScore,
        isCurated: classification.isCurated,
      };

      console.log("[Regional Classification]", {
        title: article.title,
        language,
        topic: classification.regionalTopic,
        score: classification.importanceScore,
        curated: classification.isCurated,
      });
    } else if (options?.region) {
      updateOperation.$set = {
        ...updateOperation.$set,
        region: options.region,
      };
    }

    const importedArticle = await ArticleModel.findOneAndUpdate(
      identityFilter,
      updateOperation,
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return importedArticle;
  }

  async importArticles(
    articles: NormalizedNewsArticle[],
    category: GNewsCategory,
    options?: {
      region?: "tamil-nadu" | "india" | "international";
    },
  ) {
    const results = [];

    for (const article of articles) {
      const imported = await this.importArticle(article, category, options);
      results.push(imported);
    }

    return {
      importedCount: results.length,
      articles: results,
    };
  }
}

const articleImportService = new ArticleImportService();

export default articleImportService;
