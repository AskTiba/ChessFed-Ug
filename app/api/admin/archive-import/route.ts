import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawData, overWriteExisting } = body;

    if (!rawData || typeof rawData !== "string") {
      return NextResponse.json({ error: "No raw CSV/TSV/HTML data provided." }, { status: 400 });
    }

    const lines = rawData.split(/\r?\n/).filter(line => line.trim().length > 0);
    const importedTournaments: any[] = [];
    const errors: string[] = [];

    // Helper to parse dates like "2026/01/01" or "01.01.2026" or "2026-01-01"
    const parseDate = (dateStr: string, defaultDate: Date) => {
      if (!dateStr) return defaultDate;
      const clean = dateStr.replace(/\./g, "/").replace(/-/g, "/").trim();
      const parsed = new Date(clean);
      return isNaN(parsed.getTime()) ? defaultDate : parsed;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header lines
      if (line.toLowerCase().includes("tnr") || line.toLowerCase().includes("databasekey")) continue;

      let crId = "";
      let name = "";
      let organizer = "";
      let chiefArbiter = "";
      let venue = "";
      let startDateStr = "";
      let endDateStr = "";

      // 1. HTML Table Row format detection
      if (line.includes("<tr") || line.includes("<td")) {
        const cells = line.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)?.map(c => c.replace(/<[^>]*>/g, "").trim()) || [];
        if (cells.length >= 6) {
          crId = cells[0];
          name = cells[1];
          organizer = cells[2];
          chiefArbiter = cells[3];
          venue = cells[4];
          startDateStr = cells[5];
          endDateStr = cells[6] || cells[5];
        }
      } 
      // 2. Delimited format (TSV, CSV, Semicolon)
      else {
        const delimiter = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
        const parts = line.split(delimiter).map(p => p.trim());

        if (parts.length >= 4) {
          // Usually: tnr, name, organizer, chiefArbiter, location, start, end
          crId = parts[0];
          name = parts[1];
          organizer = parts[2] || "UCF";
          chiefArbiter = parts[3] || "";
          venue = parts[4] || "Kampala";
          startDateStr = parts[5] || "";
          endDateStr = parts[6] || parts[5] || "";
        }
      }

      // Validate numeric crId
      if (!crId || !/^\d+$/.test(crId)) {
        continue; // skip invalid rows
      }

      if (!name) name = `Chess-Results Tournament #${crId}`;

      const startDate = parseDate(startDateStr, new Date());
      const endDate = parseDate(endDateStr, startDate);

      try {
        // Upsert Tournament
        const tournament = await prisma.tournament.upsert({
          where: { crId },
          update: overWriteExisting ? {
            name,
            description: organizer ? `Organized by: ${organizer}. Chief Arbiter: ${chiefArbiter}` : undefined,
            venue,
            startDate,
            endDate,
          } : {},
          create: {
            name,
            crId,
            description: organizer ? `Organized by: ${organizer}. Chief Arbiter: ${chiefArbiter}` : null,
            venue,
            startDate,
            endDate,
            totalRounds: 7, // Default
            format: "Swiss",
          },
        });

        // Initialize LiveData Cache row
        await prisma.tournamentLiveData.upsert({
          where: { tournamentId: tournament.id },
          update: {},
          create: {
            tournamentId: tournament.id,
            lastSyncedAt: new Date(),
          },
        });

        importedTournaments.push({ id: tournament.id, crId, name, startDate });
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${crId}): ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: importedTournaments.length,
      importedTournaments,
      errors,
    });
  } catch (error: any) {
    console.error("[Archive Bulk Import API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk archive import: " + error.message },
      { status: 500 }
    );
  }
}
