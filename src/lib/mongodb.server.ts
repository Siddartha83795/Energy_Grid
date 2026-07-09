import { MongoClient, Db } from "mongodb";
import process from "node:process";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export const SECURITY_LOG_RETENTION_SECONDS = 90 * 24 * 60 * 60; // 90 days

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable not configured in .env");
  }

  if (uri.includes("<username>") || uri.includes("<cluster>")) {
    console.warn(
      "MONGODB_URI still contains placeholders <username> or <cluster>. Please configure it in your .env file.",
    );
  }

  const client = new MongoClient(uri, { autoSelectFamily: false });
  await client.connect();

  // Extract database name from connection string or default to "Energy_grid"
  const dbName = uri.split("/").pop()?.split("?")[0] || "Energy_grid";
  const db = client.db(dbName);

  // Create idempotent TTL indexes for rate-limiting and audit events
  try {
    await db.collection("login_attempts").createIndex(
      { last_attempt_at: 1 },
      { expireAfterSeconds: 86400 }, // 24 hours
    );
    await db
      .collection("security_events")
      .createIndex({ created_at: 1 }, { expireAfterSeconds: SECURITY_LOG_RETENTION_SECONDS });
    console.log("Database security TTL indexes ensured.");
  } catch (err) {
    console.error("Failed to ensure database security TTL indexes:", err);
  }

  cachedClient = client;
  cachedDb = db;

  console.log(`Connected to MongoDB database: ${dbName}`);
  return db;
}
