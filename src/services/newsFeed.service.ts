import newsApiService from "./newsApi.service.js";
import { normalizeGNewsArticle } from "./newsNormalizer.service.js";

import type { GNewsArticle,GNewsCategory,GNewsTopHeadlinesParams, } from "../types/newsApi.types.js";
import type {NormalizedNewsArticle,NormalizedNewsResponse,} from "../types/normalizedArticle.types.js";

class NewsFeedService{
    private normalizeResponse(
        response: {
            totalArticles: number;
            articles: GNewsArticle[];
        }
    ): NormalizedNewsResponse{
        const articles = response.articles.map(normalizeGNewsArticle).filter((article): article is NormalizedNewsArticle => article !== null)
        return{
            totalArticles: response.totalArticles,
            articles
        };
    }

    // Fetch general or filtered top headlines
    async getTopHeadlines(params: GNewsTopHeadlinesParams = {}): Promise<NormalizedNewsResponse>{
        const response = await newsApiService.getTopHeadlines({
            country: "in",
            lang: "en",
            max: 10,
            nullable: "description,content,image",
            ...params,
        });
        return this.normalizeResponse(response)
    }
    // Fetch articles by GNews category
    async getArticlesByCategory( category: GNewsCategory): Promise<NormalizedNewsResponse>{
        return this.getTopHeadlines({ category });
    }
    // Search articles by keyword
    async searchArticles(query: string):Promise<NormalizedNewsResponse>{
        const response = await newsApiService.searchArticles({
            q: query,
            country: "in",
            lang: "en",
            max: 10,
            nullable: "description,content,image",
            sortby: "publishedAt",
        })
        return this.normalizeResponse(response);
    }
    // Fetch the regional news from tamilnadu
    async  getTamilNaduNews(language: "en" | "ta" = "en"): Promise<NormalizedNewsResponse>{
        const query = language === "ta" ? "தமிழ்நாடு OR சென்னை OR மதுரை OR கோயம்புத்தூர் OR திருச்சி OR சேலம் OR திருநெல்வேலி": '"Tamil Nadu" OR Chennai OR Madurai OR Coimbatore OR Trichy OR Salem OR Tirunelveli';
        const response = await newsApiService.searchArticles({
            q: query,
            country: "in",
            lang:language,
            max:10,
            nullable: "description,content,image",
            sortby: "publishedAt",
        })

        return this.normalizeResponse(response)
    }
}
const newsFeedService = new NewsFeedService();
export default newsFeedService;
