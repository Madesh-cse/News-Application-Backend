import "dotenv/config";
import "./dns.js";

import app from "./app.js";
import { connectDb } from "./config/database.js";

const port = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDb();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(
        "JWT secret loaded:",
        Boolean(process.env.JWT_ACCESS_SECRET)
      );
    });
  } catch (error: unknown) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();