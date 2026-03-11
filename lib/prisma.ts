import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import pc from "picocolors";

const globalForPrisma = global as unknown as { prisma: any };

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL as string,
});

export const prisma =
  globalForPrisma.prisma ||
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
    console.log(pc.blue(pc.bold("⬡ PRISMA QUERY")));
    console.log(pc.dim("Query: ") + pc.cyan(e.query));
    console.log(pc.dim("Params: ") + pc.yellow(e.params));
    console.log(pc.dim("Duration: ") + pc.green(e.duration + "ms"));
    console.log(pc.dim("────────────────────────────────────────"));
  });
  
  globalForPrisma.prisma = prisma;
}
