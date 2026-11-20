import newsApiClient from "../config/newsApi.config.js";
import type { GNewsResponse, GNewsTopHeadlinesParams, GNewsSearchParams } from "../types/newsApi.types.js";
import { retryRequest } from "../utils/retryRequest.js";

class NewsApiService{
    async getTopHeadlines(params: GNewsTopHeadlinesParams = {}): Promise<GNewsResponse>{
        return retryRequest(async()=>{
            const response = await newsApiClient.get<GNewsResponse>("/top-headlines", { params});
            return response.data;
        });
    }

    //  create a search article by keyword
    async searchArticles(params: GNewsSearchParams): Promise<GNewsResponse>{
        return retryRequest(async()=>{
            const response = await newsApiClient.get<GNewsResponse>("/search", { params})
            return response.data;
        })
    }
}

const newsApiService = new NewsApiService();
export default newsApiService;