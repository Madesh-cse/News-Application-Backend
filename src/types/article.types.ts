export const ARTICLE_STATUSES = [
    "draft",
    "published",
    "archieve"
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number]