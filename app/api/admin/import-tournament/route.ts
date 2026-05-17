import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTRF } from "@/lib/parsers/trf";
import { parseCSV } from "@/lib/parsers/csv";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isGrandPrix = formData.get("isGrandPrix") === "true";
    const dryRun = formData.get("dryRun") === "true";
    const autoCreatePlayers = formData.get("autoCreatePlayers") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileContent = await file.text();
    const fileName = file.name.toLowerCase();
    
    let parsedTournament: any;
    
    // Parse depending on file extension
    if (fileName.endsWith(".trf") || fileName.endsWith(".txt")) {
      parsedTournament = parseTRF(fileContent);
    } else if (fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
      parsedTournament = parseCSV(fileContent);
    } else {
      return NextResponse.json({ error: "Unsupported file format. Please upload a .trf, .txt, or .csv file." }, { status: 400 });
    }

    const { players } = parsedTournament;

    // ─── Phase 1: Match players against database ───────────────────────
    const dryRunReport: any[] = [];
    const matchedPlayerIds: string[] = [];
    const playersToCreate: any[] = [];
    const scoresToCreate: any[] = [];

    for (const p of players) {
      let dbPlayer = null;

      // 1. First, search by FIDE ID if present
      if (p.fideId) {
        dbPlayer = await prisma.player.findFirst({
          where: {
            OR: [
              { fideId: p.fideId.toString() },
              { fideId: parseInt(p.fideId, 10).toString() }
            ]
          }
        });
      }

      // 2. Second, search by Name (case-insensitive) if FIDE ID search yielded nothing
      if (!dbPlayer) {
        dbPlayer = await prisma.player.findFirst({
          where: {
            name: {
              equals: p.name,
              mode: "insensitive"
            }
          }
        });
      }

      if (dbPlayer) {
        matchedPlayerIds.push(dbPlayer.id);
        dryRunReport.push({
          rank: p.rank,
          name: p.name,
          fideId: p.fideId,
          rating: p.rating,
          points: p.points,
          matched: true,
          dbPlayerName: dbPlayer.name,
          dbPlayerRating: dbPlayer.rating,
          dbPlayerId: dbPlayer.id
        });
        
        scoresToCreate.push({
          playerId: dbPlayer.id,
          score: p.points,
          buchholz: null // Set Buchholz if parsed in future
        });
      } else {
        // Player is unmatched
        playersToCreate.push({
          name: p.name,
          fideId: p.fideId ? p.fideId.toString() : null,
          rating: p.rating,
          federation: p.federation || "UGA",
        });

        dryRunReport.push({
          rank: p.rank,
          name: p.name,
          fideId: p.fideId,
          rating: p.rating,
          points: p.points,
          matched: false,
          federation: p.federation || "UGA"
        });

        scoresToCreate.push({
          playerIndex: playersToCreate.length - 1, // Store index for mapping later
          score: p.points,
          buchholz: null
        });
      }
    }

    // ─── If DRY-RUN: Return the parsed comparison metrics ────────────────
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        meta: {
          name: parsedTournament.name,
          venue: parsedTournament.venue || "TBD",
          city: parsedTournament.city || "TBD",
          startDate: parsedTournament.startDate,
          endDate: parsedTournament.endDate,
          rounds: parsedTournament.numberOfRounds,
          totalPlayers: players.length,
          matchedCount: matchedPlayerIds.length,
          unmatchedCount: playersToCreate.length
        },
        players: dryRunReport
      });
    }

    // ─── If EXECUTE: Write to database in a secure transaction ────────────
    if (playersToCreate.length > 0 && !autoCreatePlayers) {
      return NextResponse.json({
        error: "Unmatched players found. You must check 'Auto-register new players' or match them first."
      }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create unmatched players if requested
      const newlyCreatedPlayersMap: { [key: number]: string } = {};
      
      for (let i = 0; i < playersToCreate.length; i++) {
        const pData = playersToCreate[i];
        const newPlayer = await tx.player.create({
          data: {
            name: pData.name,
            fideId: pData.fideId,
            rating: pData.rating,
            federation: pData.federation
          }
        });
        newlyCreatedPlayersMap[i] = newPlayer.id;
        matchedPlayerIds.push(newPlayer.id);
      }

      // 2. Map score lists to active CUIDs
      const finalScores = scoresToCreate.map((s: any) => {
        if (s.playerId) return { playerId: s.playerId, score: s.score, buchholz: s.buchholz };
        return { playerId: newlyCreatedPlayersMap[s.playerIndex], score: s.score, buchholz: s.buchholz };
      });

      // 3. Create the Tournament
      const tournament = await tx.tournament.create({
        data: {
          name: parsedTournament.name,
          description: `Imported tournament from FIDE TRF/CSV sheet. Total rounds: ${parsedTournament.numberOfRounds}.`,
          startDate: parsedTournament.startDate || new Date(),
          endDate: parsedTournament.endDate || new Date(),
          venue: parsedTournament.venue || "Official Club Venue",
          totalRounds: parsedTournament.numberOfRounds || 5,
          isGrandPrix,
          players: {
            connect: matchedPlayerIds.map(id => ({ id }))
          },
          scores: {
            create: finalScores.map((s: any) => ({
              playerId: s.playerId,
              score: s.score,
              buchholz: s.buchholz
            }))
          }
        }
      });

      // 4. If it's a Grand Prix event, auto-distribute Grand Prix points to the top 5
      if (isGrandPrix) {
        // Sort final scores to determine top positions
        const sortedScores = [...finalScores].sort((a, b) => b.score - a.score);
        
        // Grand Prix distribution rules:
        // 1st: 10 pts
        // 2nd: 8 pts
        // 3rd: 6 pts
        // 4th: 4 pts
        // 5th: 2 pts
        const gpDistribution = [10, 8, 6, 4, 2];
        
        for (let i = 0; i < Math.min(sortedScores.length, gpDistribution.length); i++) {
          const s = sortedScores[i];
          const pts = gpDistribution[i];
          
          await tx.grandPrixPoint.create({
            data: {
              playerId: s.playerId,
              tournamentId: tournament.id,
              points: pts
            }
          });
        }
      }

      return tournament;
    });

    return NextResponse.json({
      success: true,
      dryRun: false,
      message: "Tournament imported and seeded successfully!",
      tournamentId: result.id,
      importedPlayersCount: matchedPlayerIds.length
    });

  } catch (error) {
    console.error("[Tournament Import API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + (error as Error).message }, { status: 500 });
  }
}
