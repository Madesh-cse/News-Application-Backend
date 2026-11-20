export interface GNewsSource{
    id?: string;
    name: string,
    url: string,
    country?: string;
}
export interface GNewsArticle {
   id?: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  lang?: string;
  source: GNewsSource;
}
export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}
export type GNewsCategory = | "general" | "world" | "nation" | "business"| "technology"| "entertainment"
  | "sports"
  | "science"
  | "health";

export interface GNewsTopHeadlinesParams {
  category?: GNewsCategory;
  country?: string;
  lang?: string;
  max?: number;
  nullable?: string;
  q?: string;
}
export interface GNewsSearchParams {
  q: string;
  country?: string;
  lang?: string;
  max?: number;
  from?: string;
  to?: string;
  sortby?: "publishedAt" | "relevance";
  nullable?: string;
}