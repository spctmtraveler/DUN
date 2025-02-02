
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;
// Use the pooled connection for better reliability
const pooledConnectionString = connectionString.replace('postgres.', 'postgres-pooler.');

export const db = drizzle({
  connectionString: pooledConnectionString,
  schema,
  ws: ws,
});
