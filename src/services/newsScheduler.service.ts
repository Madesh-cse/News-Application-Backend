
import cron from "node-cron";

import newsFeedService from "./newsFeed.service.js";
import articleImportService from "./articleImport.service.js";

import type { GNewsCategory } from "../types/newsApi.types.js";
import type { NormalizedNewsArticle } from "../types/normalizedArticle.types.js";

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
];

class NewsSchedularService {
  private isRunning = false;
  private isRegionalSyncRunning = false;
  private isScheduled = false;

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Existing synchronization for all nine categories
  async syncAllCategory(): Promise<void> {
    if (this.isRunning) {
      console.log("[News Scheduler] Previous sync is still running. Skipping.");
      return;
    }

    this.isRunning = true;

    const startedAt = Date.now();
    let totalProcessed = 0;
    let successfulCategories = 0;
    let failedCategories = 0;

    console.log("\n========================================");
    console.log("[News Scheduler] Starting category synchronization");
    console.log("[News Scheduler] Categories:", NEWS_CATEGORIES.length);
    console.log("========================================\n");

    try {
      for (const category of NEWS_CATEGORIES) {
        try {
          console.log(`[News Scheduler] Fetching: ${category}`);

          const response =
            await newsFeedService.getArticlesByCategory(category);

          console.log(
            `[News Scheduler] ${category}: ${response.articles.length} articles received`
          );

          const result = await articleImportService.importArticles(
            response.articles,
            category
          );

          totalProcessed += result.importedCount;
          successfulCategories++;

          console.log(
            `[News Scheduler] ${category}: ${result.importedCount} articles processed`
          );
        } catch (err: unknown) {
          failedCategories++;

          console.error(
            `[News Scheduler] Failed to sync category: ${category}`,
            err
          );
        }

        // Avoid sending requests too quickly on the GNews Free plan.
        await this.delay(1500);
      }
    } finally {
      this.isRunning = false;

      const duration = ((Date.now() - startedAt) / 1000).toFixed(2);

      console.log("\n========================================");
      console.log("[News Scheduler] Category synchronization completed");
      console.log("Successful categories:", successfulCategories);
      console.log("Failed categories:", failedCategories);
      console.log("Total articles processed:", totalProcessed);
      console.log("Duration:", `${duration} seconds`);
      console.log("========================================\n");
    }
  }

  // Remove duplicate articles from English and Tamil responses.
  private removeDuplicateArticles(
    articles: NormalizedNewsArticle[]
  ): NormalizedNewsArticle[] {
    const uniqueArticles = new Map<string, NormalizedNewsArticle>();

    for (const article of articles) {
      const identity = article.providerArticleId
        ? `${article.provider}:${article.providerArticleId}`
        : `${article.provider}:${article.articleUrl.trim().toLowerCase()}`;

      if (!uniqueArticles.has(identity)) {
        uniqueArticles.set(identity, article);
      }
    }

    return Array.from(uniqueArticles.values());
  }

  // Dedicated Tamil Nadu regional news synchronization.
  async syncTamilNaduNews(): Promise<void> {
    if (this.isRegionalSyncRunning) {
      console.log(
        "[Tamil Nadu Scheduler] Previous regional sync is running. Skipping."
      );
      return;
    }

    this.isRegionalSyncRunning = true;

    const startedAt = Date.now();
    let englishCount = 0;
    let tamilCount = 0;
    let importedCount = 0;

    const regionalArticles: NormalizedNewsArticle[] = [];

    console.log("\n========================================");
    console.log("[Tamil Nadu Scheduler] Starting regional news sync");
    console.log("========================================\n");

    try {
      // Fetch English regional news.
      try {
        console.log("[Tamil Nadu Scheduler] Fetching English news...");

        const englishResponse =
          await newsFeedService.getTamilNaduNews("en");

        regionalArticles.push(...englishResponse.articles);
        englishCount = englishResponse.articles.length;

        console.log(
          `[Tamil Nadu Scheduler] English articles received: ${englishCount}`
        );
      } catch (error: unknown) {
        console.error(
          "[Tamil Nadu Scheduler] English news fetch failed:",
          error
        );
      }

      // Wait before making the next API request.
      await this.delay(1500);

      // Fetch Tamil regional news.
      try {
        console.log("[Tamil Nadu Scheduler] Fetching Tamil news...");

        const tamilResponse =
          await newsFeedService.getTamilNaduNews("ta");

        regionalArticles.push(...tamilResponse.articles);
        tamilCount = tamilResponse.articles.length;

        console.log(
          `[Tamil Nadu Scheduler] Tamil articles received: ${tamilCount}`
        );
      } catch (error: unknown) {
        console.error(
          "[Tamil Nadu Scheduler] Tamil news fetch failed:",
          error
        );
      }

      // Remove duplicates between both language responses.
      const uniqueArticles =
        this.removeDuplicateArticles(regionalArticles);

      console.log(
        `[Tamil Nadu Scheduler] Unique regional articles: ${uniqueArticles.length}`
      );

      if (uniqueArticles.length > 0) {
        const result = await articleImportService.importArticles(
          uniqueArticles,
          "nation",
          {
            region: "tamil-nadu",
          }
        );

        importedCount = result.importedCount;
      }

      console.log(
        `[Tamil Nadu Scheduler] Regional articles processed: ${importedCount}`
      );
    } catch (error: unknown) {
      console.error(
        "[Tamil Nadu Scheduler] Regional synchronization failed:",
        error
      );
    } finally {
      this.isRegionalSyncRunning = false;

      const duration = ((Date.now() - startedAt) / 1000).toFixed(2);

      console.log("\n========================================");
      console.log("[Tamil Nadu Scheduler] Synchronization completed");
      console.log("English articles:", englishCount);
      console.log("Tamil articles:", tamilCount);
      console.log("Articles processed:", importedCount);
      console.log("Duration:", `${duration} seconds`);
      console.log("========================================\n");
    }
  }

  // Start automatic synchronization.
  startScheduler(): void {
    if (this.isScheduled) {
      console.log("[News Scheduler] Scheduler is already running.");
      return;
    }

    // Existing nine categories: every 6 hours.
    cron.schedule("0 */6 * * *", () => {
      void this.syncAllCategory();
    });

    // Tamil Nadu regional feed: every 6 hours,
    // offset by 30 minutes from the category scheduler.
    cron.schedule("30 */6 * * *", () => {
      void this.syncTamilNaduNews();
    });

    this.isScheduled = true;

    console.log(
      "[News Scheduler] Category synchronization scheduled every 6 hours."
    );

    console.log(
      "[Tamil Nadu Scheduler] Regional synchronization scheduled every 6 hours, at 30 minutes past."
    );
  }
}

const newsSchedulerService = new NewsSchedularService();

export default newsSchedulerService;
