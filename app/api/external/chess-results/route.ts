import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  scrapeTournamentDetails,
  scrapeStandings,
  scrapeRoster,
  scrapePairings,
  scrapeUGAFederationTournaments,
} from "@/lib/scrapers/chessResults";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("id")?.trim();
    const view = searchParams.get("view")?.trim() || "details";
    const roundStr = searchParams.get("rd")?.trim() || "1";
    const round = parseInt(roundStr, 10) || 1;

    let data: any;

    if (view === "list") {
      const yearStr = searchParams.get("year")?.trim();
      if (yearStr && /^\d{4}$/.test(yearStr)) {
        const yearNum = parseInt(yearStr, 10);
        // Query our DB for tournaments in that year
        const dbTournaments = await prisma.tournament.findMany({
          where: {
            startDate: {
              gte: new Date(`${yearNum}-01-01T00:00:00.000Z`),
              lte: new Date(`${yearNum}-12-31T23:59:59.999Z`)
            }
          },
          orderBy: { startDate: 'desc' },
          select: { crId: true, name: true, startDate: true, endDate: true }
        });

        const now = new Date();
        const formattedList = dbTournaments.filter(t => t.crId).map(t => {
          const s = t.startDate;
          const e = t.endDate;
          let isActive = false;
          if (s && e) {
            const endOfDay = new Date(e);
            endOfDay.setHours(23, 59, 59, 999);
            if (now >= s && now <= endOfDay) isActive = true;
          }

          return {
            id: t.crId,
            name: t.name,
            startDate: s?.toISOString(),
            endDate: e?.toISOString(),
            isActive,
            year: yearStr
          };
        });

        if (formattedList.length > 0) {
          return NextResponse.json({
            success: true,
            view,
            data: formattedList,
            source: "Database Archive"
          });
        }
      }

      // Default fallback to scraping recent 50 from fed.aspx
      data = await scrapeUGAFederationTournaments();
      return NextResponse.json({
        success: true,
        view,
        data,
        source: "Live Scrape (fed.aspx)"
      });
    }

    if (!tournamentId || !/^\d+$/.test(tournamentId)) {
      return NextResponse.json(
        { error: "A valid numeric Chess-Results Tournament ID (e.g. 1015694) is required." },
        { status: 400 }
      );
    }

    // ─── TIERED CACHING LOGIC (OPTION B / OPTION A HYBRID) ───
    // 1. Check if this tournament exists in our DB linked by crId
    const tournament = await prisma.tournament.findUnique({
      where: { crId: tournamentId },
      include: { liveData: true },
    });

    if (tournament) {
      const now = new Date();
      const isCompleted = tournament.endDate < now;
      const liveData = tournament.liveData;

      // Calculate cache age
      const cacheAgeMs = liveData ? now.getTime() - new Date(liveData.lastSyncedAt).getTime() : Infinity;
      const isFresh = liveData && (isCompleted || cacheAgeMs < 5 * 60 * 1000); // 5 minutes TTL for live, infinite for completed

      if (isFresh) {
        let cachedData: any = null;
        if (view === "details") {
          cachedData = {
            id: tournament.crId,
            name: tournament.name,
            organizer: null,
            chiefArbiter: null,
            location: tournament.venue,
            rounds: tournament.totalRounds
          };
        }
        if (view === "standings" && liveData.standings) {
          cachedData = Array.isArray(liveData.standings) 
            ? { formatType: "INDIVIDUAL", tbHeaders: ["TB1", "TB2"], players: liveData.standings } 
            : liveData.standings;
        }
        if (view === "roster" && liveData.roster) cachedData = liveData.roster;
        if (view === "pairings" && liveData.pairings) {
          const pMap = (liveData.pairings as Record<string, any>) || {};
          if (pMap[roundStr]) cachedData = pMap[roundStr];
        }

        if (cachedData) {
          return NextResponse.json({
            success: true,
            tournamentId,
            view,
            data: cachedData,
            cached: true,
            tier: isCompleted ? "Option A (Permanent Static Storage)" : "Option B (5-Min Live Cache)",
            syncedAt: liveData.lastSyncedAt,
          });
        }
      }
    }

    // ─── SCRAPE FRESH DATA FROM CHESS-RESULTS ───
    switch (view) {
      case "standings":
        data = await scrapeStandings(tournamentId, round);
        break;
      case "roster":
        data = await scrapeRoster(tournamentId);
        break;
      case "pairings":
        data = await scrapePairings(tournamentId, round);
        break;
      default:
        data = await scrapeTournamentDetails(tournamentId);
        break;
    }

    // ─── UPDATE DATABASE CACHE IF LINKED TO AN OFFICIAL TOURNAMENT ───
    if (tournament && view !== "details") {
      const liveData = tournament.liveData;
      const updatePayload: any = { lastSyncedAt: new Date() };

      if (view === "standings") updatePayload.standings = data;
      if (view === "roster") updatePayload.roster = data;
      if (view === "pairings") {
        const existingPairings = liveData ? (liveData.pairings as Record<string, any>) || {} : {};
        existingPairings[roundStr] = data;
        updatePayload.pairings = existingPairings;
      }

      await prisma.tournamentLiveData.upsert({
        where: { tournamentId: tournament.id },
        update: updatePayload,
        create: {
          tournamentId: tournament.id,
          ...updatePayload,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      tournamentId,
      view,
      data,
      cached: false,
      tier: tournament ? (tournament.endDate < new Date() ? "Option A (Newly Cached)" : "Option B (Live Scraped)") : "Transient Scrape",
      syncedAt: new Date(),
    });

    if (process.env.NODE_ENV === "production") {
      response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    } else {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    }

    return response;
  } catch (error) {
    console.error("[Chess-Results API Scraper] Error:", error);
    return NextResponse.json(
      { error: "Failed to scrape live data from Chess-Results: " + (error as Error).message },
      { status: 500 }
    );
  }
}
