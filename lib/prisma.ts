import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pc from "picocolors";

const globalForPrisma = global as unknown as { prisma_v2: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma_v2 ||
  new PrismaClient({
    adapter,
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "error" },
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" },
    ],
  });

// Beautiful Logging for Development
if (process.env.NODE_ENV !== "production") {
  prisma.$on("query", (e: any) => {
    // ... same logging code ...
  });
  
  globalForPrisma.prisma_v2 = prisma;
}
