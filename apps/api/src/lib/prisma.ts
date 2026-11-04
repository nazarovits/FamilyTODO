import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be configured for API database access.");
}

let databaseUrl: URL;
try {
  databaseUrl = new URL(connectionString);
} catch {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
}

if (
  databaseUrl.protocol !== "postgres:" &&
  databaseUrl.protocol !== "postgresql:"
) {
  throw new Error("DATABASE_URL must use the PostgreSQL protocol.");
}

databaseUrl.searchParams.set("sslmode", "verify-full");

const adapter = new PrismaPg({
  connectionString: databaseUrl.toString(),
  max: 5,
});

export const prisma = new PrismaClient({ adapter });
