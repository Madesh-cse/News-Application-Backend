import "dotenv/config";
import "../src/dns.js";
import mongoose from "mongoose";
import ArticleModel from "../src/models/article.model.js";

const updateArticleTextIndex = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

    const indexes = await ArticleModel.collection.indexes();

    const existingTextIndex = indexes.find(
      (index) => index.weights
    );

    if (existingTextIndex) {
      await ArticleModel.collection.dropIndex(existingTextIndex.name);
      console.log("Old text index dropped");
    }

    await ArticleModel.collection.createIndex({
      title: "text",
      description: "text",
      content: "text",
      tags: "text",
    });

    console.log("New article text index created successfully");
    const updatedIndexes = await ArticleModel.collection.indexes();
   console.log("Updated article text indexes:",updatedIndexes.filter((index) => index.weights));
  } catch (error) {
    console.error("Index migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

updateArticleTextIndex();