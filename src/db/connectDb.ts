import dotenv from "dotenv";
dotenv.config();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const connectDb = async () => {
  const client = postgres(process.env.DATABASE_URL as string);
  const db = drizzle({ client });
};
