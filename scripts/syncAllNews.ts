
import "../src/dns.js";
import "dotenv/config";

import mongoose from "mongoose";

import { connectDb } from "../src/config/database.js";
import newsSchedulerService from "../src/services/newsScheduler.service.js";

const syncAllNews = async (): Promise<void> => {
  try {
    console.log("[Manual Sync] Connecting to MongoDB...");
    await connectDb();
    console.log("[Manual Sync] Starting synchronization...");
    await newsSchedulerService.syncAllCategory();
    console.log("[Manual Sync] Synchronization finished.");
  } catch (error: unknown) {
    console.error("[Manual Sync] Synchronization failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("[Manual Sync] MongoDB connection closed.");
  }
};

void syncAllNews();
