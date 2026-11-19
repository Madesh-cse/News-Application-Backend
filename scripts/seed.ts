import "../src/dns.js";
import "dotenv/config"
import mongoose from "mongoose"

import { connectDb } from "../src/config/database.js"
import SourceModel from "../src/models/source.model.js"
import CategoryModel from "../src/models/category.model.js"

const categories = [
  {
    name: "Politics",
    slug: "politics",
    description: "Political news, government policies and elections.",
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Latest technology, AI, software and innovation news.",
  },
  {
    name: "Business",
    slug: "business",
    description: "Business, finance, markets and economic updates.",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Sports news, matches, tournaments and results.",
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "Movies, television, celebrities and entertainment news.",
  },
  {
    name: "Health",
    slug: "health",
    description: "Healthcare, medical research and wellness news.",
  },
  {
    name: "Science",
    slug: "science",
    description: "Scientific discoveries, research and space exploration.",
  },
  {
    name: "World",
    slug: "world",
    description: "International news and global developments.",
  },
  {
    name: "India",
    slug: "india",
    description: "Latest news and updates from across India.",
  },
];

// Initial news source data
const sources = [
  {
    name: "BBC News",
    providerId: null,
    websiteUrl: "https://www.bbc.com/news",
    description: "International news and journalism from BBC.",
  },
  {
    name: "Reuters",
    providerId: null,
    websiteUrl: "https://www.reuters.com",
    description: "Global news, business and financial reporting.",
  },
  {
    name: "Associated Press",
    providerId: null,
    websiteUrl: "https://apnews.com",
    description: "Independent global news reporting from AP.",
  },
];

// Create a Seed Catagories
const seedCatagories = async()=>{
    const operations = await categories.map((category)=>({
        updateOne:{
            filter:{ slug: category.slug},
            update:{
                $set:{
                    ...category,
                    isActive: true,
                },
            },
            upsert: true,
        }
    }));

    const result = await CategoryModel.bulkWrite(operations);
    console.log("Categories seeded successfully.");
    console.log("Inserted:", result.upsertedCount);
    console.log("Updated:", result.modifiedCount);
}

// Create a seed sources
const seedSources = async()=>{
    for(const source of sources){
        await SourceModel.updateOne({
            name: source.name
        },{
            $set:{
                ...source,
                isActive: true
            }
        },{upsert: true})
    }
    console.log("News sources seeded successfully.")
}

// Main seed function
const seedDatabase = async()=>{
    try{
        await connectDb();
        console.log("Starting database seeding...");

        await seedCatagories();
        await seedSources();
        console.log("Database seeding completed successfully.");
    }
    catch(error:any){
        console.error("Database seeding failed:", error);
    }
    finally{
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
}

seedDatabase();