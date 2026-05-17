import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/fide/rankings
 * 
 * Serves FIDE rankings from our own database (self-hosted data).
 * 
 * Query Parameters:
 *   - country: Country code (default: "UGA")
 *   - sort: "standard" | "rapid" | "blitz" (default: "standard")
 *   - limit: Number of results (default: 100, max: 500)
 *   - active: "true" to filter inactive players (default: show all)
 *   - q: Search query (name or FIDE ID)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const country = searchParams.get("country") || "UGA";
    const sort = searchParams.get("sort") || "standard";
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);
    const activeOnly = searchParams.get("active") === "true";
    const query = searchParams.get("q")?.trim() || "";

    // ─── Build the WHERE clause ──────────────────────────────────────
    const where: any = { country };

    if (activeOnly) {
      // Active players: flag is null (not "i" for inactive)
      where.flag = null;
    }

    if (query) {
      // If query is a number, search by FIDE ID
      if (/^\d+$/.test(query)) {
        where.fideId = parseInt(query, 10);
      } else {
        // Search by name (case-insensitive contains)
        where.name = { contains: query };
      }
    }

    // ─── Determine sort field ────────────────────────────────────────
    let orderBy: any;
    switch (sort) {
      case "rapid":
        orderBy = { rapidRating: "desc" as const };
        break;
      case "blitz":
        orderBy = { blitzRating: "desc" as const };
        break;
      default:
        orderBy = { rating: "desc" as const };
    }

    // ─── Query database ──────────────────────────────────────────────
    const [players, lastSync] = await Promise.all([
      prisma.fidePlayer.findMany({
        where,
        orderBy,
        take: limit,
      }),
      prisma.fideSyncLog.findFirst({
        where: { status: "SUCCESS" },
        orderBy: { syncedAt: "desc" },
        select: { syncedAt: true, period: true, totalRows: true },
      }),
    ]);

    // ─── Response ────────────────────────────────────────────────────
    const response = NextResponse.json({
      players,
      meta: {
        count: players.length,
        country,
        sort,
        lastSync: lastSync
          ? {
              syncedAt: lastSync.syncedAt,
              period: lastSync.period,
              totalPlayers: lastSync.totalRows,
            }
          : null,
      },
    });

    // Cache for 1 hour (FIDE data updates monthly, so this is very safe)
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    return response;
  } catch (error) {
    console.error("[FIDE Rankings API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rankings" },
      { status: 500 }
    );
  }
}
