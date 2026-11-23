import cron from "node-cron";

import newsFeedService from "./newsFeed.service.js";
import articleImportService from "./articleImport.service.js";
import type { GNewsCategory } from "../types/newsApi.types.js";

const NEWS_CATEGORIES: GNewsCategory[] = [
  "general",
  "world",
  "nation",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health",
]

class NewsSchedularService{
    private isRunning = false;
    private isScheduled = false;

    async syncAllCategory():Promise<void>{
        if(this.isRunning){
            console.log("[News Scheduler] Previous sync is still running. Skipping.");
            return;
        }
        this.isRunning = true;
        const startedAt = Date.now();
        let totalProcessed = 0;
        let successfulCategories = 0;
        let failedCategories = 0;

        console.log("\n========================================");
        console.log("[News Scheduler] Starting news synchronization");
        console.log("[News Scheduler] Categories:", NEWS_CATEGORIES.length);
        console.log("========================================\n");

        try{
            for(const category of NEWS_CATEGORIES){
                try{
                    console.log(`[News Scheduler] Fetching: ${category}`);
                    // Fetch and normalize the Gnews articles
                    const response = await newsFeedService.getArticlesByCategory(category);
                    console.log(`[News Scheduler] ${category}: ${response.articles.length} articles received`);
                    // import article into mongodb
                    const result = await articleImportService.importArticles(
                        response.articles,
                        category
                    );
                    totalProcessed += result.importedCount;
                    successfulCategories++;
                    console.log(`[News Scheduler] ${category}: ${result.importedCount} articles processed successfully`);

                }
                catch(err:unknown){
                    failedCategories++;
                    console.error(`[News Scheduler] Failed to sync category: ${category}`,err);
                    continue;
                }
            }
        }
        finally{
            this.isRunning = false;
            const duration = ((Date.now() - startedAt) / 1000).toFixed(2);

            console.log("\n========================================");
            console.log("[News Scheduler] Synchronization completed");
            console.log("Successful categories:", successfulCategories);
            console.log("Failed categories:", failedCategories);
            console.log("Total articles processed:", totalProcessed);
            console.log("Duration:", `${duration} seconds`);
            console.log("========================================\n");
        }
    }

    // Start automatic synchronization every 30 minutes
    startScheduler():void{
        if(this.isScheduled){
            console.log("[News Scheduler] Scheduler is already running.");
            return;
        }
        cron.schedule("*/30 * * * *", ()=>{
            void this.syncAllCategory();
        })
        this.isScheduled = true;
        console.log("[News Scheduler] Automatic synchronization scheduled every 30 minutes.");
    }
}

const newsSchedulerService = new NewsSchedularService();

export default newsSchedulerService;