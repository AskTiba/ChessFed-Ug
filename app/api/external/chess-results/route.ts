import { NextRequest, NextResponse } from "next/server";
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
      data = await scrapeUGAFederationTournaments();
      return NextResponse.json({
        success: true,
        view,
        data,
      });
    }

    if (!tournamentId || !/^\d+$/.test(tournamentId)) {
      return NextResponse.json(
        { error: "A valid numeric Chess-Results Tournament ID (e.g. 1015694) is required." },
        { status: 400 }
      );
    }

    switch (view) {
      case "standings":
        data = await scrapeStandings(tournamentId);
        break;
      case "roster":
        data = await scrapeRoster(tournamentId);
        break;
      case "pairings":
        data = await scrapePairings(tournamentId, round);
        break;
      default:
        // By default, fetch core tournament details (name, venue, arbiter, rounds)
        data = await scrapeTournamentDetails(tournamentId);
        break;
    }

    const response = NextResponse.json({
      success: true,
      tournamentId,
      view,
      data,
    });

    // Cache standings & rosters for 5 minutes in production to mitigate speed lag and protect Chess-Results servers
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
