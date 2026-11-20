// Because our application should not depend on GNews's response format. If we switch providers later, we want our database and frontend to continue using the same internal structure.

export interface NormalizedNewsArticle {
  provider: "gnews";
  providerArticleId: string | null;
  title: string;
  description: string | null;
  content: string | null;
  articleUrl: string;
  coverImage: string | null;
  publishedAt: Date;
  language: string | null;
  source: {
    providerId: string | null;
    name: string;
    websiteUrl: string;
    country: string | null;
  };
}

export interface NormalizedNewsResponse {
  totalArticles: number;
  articles: NormalizedNewsArticle[];
}
