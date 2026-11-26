
import "dotenv/config";
import "../dns.js";

import { connectDb } from "../config/database.js";
import mongoose from "mongoose";

import newsSchedulerService from "../services/newsScheduler.service.js";

async function testTamilNaduNews() {
  try {
    console.log("\n--- CONNECTING TO MONGODB ---");

    await connectDb();

    console.log("\n--- IMPORTING TAMIL NADU NEWS ---");

    await newsSchedulerService.syncTamilNaduNews();

    console.log("\nTamil Nadu regional import test completed.");
  } catch (error) {
    console.error("Tamil Nadu news test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

testTamilNaduNews();
