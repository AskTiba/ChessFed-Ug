import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import pc from "picocolors";

const globalForPrisma = global as unknown as { prisma_v2: any };

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL as string,
});

export const prisma =
  globalForPrisma.prisma_v2 ||
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "error" },
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" },
    ],
    adapter,
  });

// Beautiful Logging for Development
if (process.env.NODE_ENV !== "production") {
  prisma.$on("query", (e: any) => {
    // ... same logging code ...
  });
  
  globalForPrisma.prisma_v2 = prisma;
}
