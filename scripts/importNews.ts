
import "../src/dns.js";
import "dotenv/config";

import mongoose from "mongoose";

import { connectDb } from "../src/config/database.js";
import newsFeedService from "../src/services/newsFeed.service.js";
import articleImportService from "../src/services/articleImport.service.js";

const importNews = async () => {
  try {
    await connectDb();

    console.log("Fetching technology news...");

    const response = await newsFeedService.getArticlesByCategory("technology");
    console.log("Articles received:", response.articles.length);
    const result = await articleImportService.importArticles(response.articles,"technology");

    console.log("Import completed.");
    console.log("Processed:", result.importedCount);

    // Run the same import again to verify duplicate prevention.
    const secondImport = await articleImportService.importArticles(response.articles,"technology");

    console.log("Second import completed.");
    console.log("Processed again:", secondImport.importedCount);
  } catch (error) {
    console.error("News import failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
};

importNews();
