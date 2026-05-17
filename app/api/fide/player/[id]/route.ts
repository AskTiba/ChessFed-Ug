import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/fide/player/[id]
 * 
 * Returns a single FIDE player's data.
 * 
 * Resolution Order:
 *   1. Check our own FidePlayer table (canonical for UGA players)
 *   2. Fallback to Lichess FIDE API (for non-UGA or unsyced players)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fideId = parseInt(id, 10);

  if (isNaN(fideId)) {
    return NextResponse.json(
      { error: "Invalid FIDE ID. Must be a number." },
      { status: 400 }
    );
  }

  try {
    // ─── Source 1: Our own database (canonical) ──────────────────────
    const dbPlayer = await prisma.fidePlayer.findUnique({
      where: { fideId },
    });

    if (dbPlayer) {
      const response = NextResponse.json({
        source: "chessfed-db",
        player: {
          id: dbPlayer.fideId,
          name: dbPlayer.name,
          federation: dbPlayer.country,
          year: dbPlayer.birthday,
          sex: dbPlayer.sex,
          title: dbPlayer.title,
          standard: dbPlayer.rating,
          rapid: dbPlayer.rapidRating > 0 ? dbPlayer.rapidRating : undefined,
          blitz: dbPlayer.blitzRating > 0 ? dbPlayer.blitzRating : undefined,
          games: dbPlayer.games,
          kFactor: dbPlayer.kFactor,
          flag: dbPlayer.flag,
          syncedAt: dbPlayer.syncedAt,
        },
      });

      response.headers.set(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
      );

      return response;
    }

    // ─── Source 2: Lichess FIDE API (fallback for non-UGA players) ────
    const lichessRes = await fetch(
      `https://lichess.org/api/fide/player/${fideId}`,
      { next: { revalidate: 3600 } }
    );

    if (lichessRes.ok) {
      const data = await lichessRes.json();

      const response = NextResponse.json({
        source: "lichess",
        player: {
          id: data.id,
          name: data.name,
          federation: data.federation,
          year: data.year,
          sex: data.gender,
          title: data.title,
          standard: data.standard,
          rapid: data.rapid,
          blitz: data.blitz,
        },
      });

      response.headers.set(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
      );

      return response;
    }

    // ─── Not found in any source ─────────────────────────────────────
    return NextResponse.json(
      { error: `Player with FIDE ID ${fideId} not found.` },
      { status: 404 }
    );

  } catch (error) {
    console.error(`[FIDE Player API] Error for ID ${fideId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch player data" },
      { status: 500 }
    );
  }
}
