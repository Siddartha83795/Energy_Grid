import { MongoClient, Db } from "mongodb";
import process from "node:process";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

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

  cachedClient = client;
  cachedDb = db;

  console.log(`Connected to MongoDB database: ${dbName}`);
  return db;
}
