import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";
import { createWriteStream, createReadStream, mkdirSync, existsSync, unlinkSync, rmSync } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { execSync } from "child_process";
import path from "path";

// The official FIDE bulk download URL (updated monthly on the 1st)
const FIDE_XML_URL = "https://ratings.fide.com/download/players_list_xml.zip";

// Target country code to filter
const TARGET_COUNTRY = "UGA";

/**
 * POST /api/fide/sync
 * 
 * Downloads the official FIDE XML rating list, parses it,
 * filters for Uganda (UGA) players, and upserts them into the database.
 * 
 * Protected by CRON_SECRET for Vercel Cron Jobs and admin access.
 */
export async function POST(request: NextRequest) {
  // ─── Auth Check ────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, require the CRON_SECRET. In dev, allow without it.
  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();
  const tmpDir = path.join(process.cwd(), ".fide-sync-tmp");

  try {
    // ─── Step 1: Download the ZIP ──────────────────────────────────────
    console.log("[FIDE Sync] Downloading FIDE XML from:", FIDE_XML_URL);

    const response = await fetch(FIDE_XML_URL);
    if (!response.ok || !response.body) {
      throw new Error(`FIDE download failed: HTTP ${response.status}`);
    }

    // Create temp directory
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir, { recursive: true });
    }

    const zipPath = path.join(tmpDir, "players_list_xml.zip");
    const writeStream = createWriteStream(zipPath);

    // Stream the download to disk to avoid loading 46MB into memory
    await pipeline(
      Readable.fromWeb(response.body as any),
      writeStream
    );

    console.log("[FIDE Sync] Download complete. Extracting...");

    // ─── Step 2: Unzip ─────────────────────────────────────────────────
    execSync(`unzip -o "${zipPath}" -d "${tmpDir}"`, { stdio: "pipe" });

    // Find the XML file (usually named players_list_xml_foa.xml or similar)
    const { readdirSync } = await import("fs");
    const files = readdirSync(tmpDir).filter((f: string) => f.endsWith(".xml"));
    if (files.length === 0) {
      throw new Error("No XML file found in the FIDE ZIP archive");
    }
    const xmlPath = path.join(tmpDir, files[0]);
    console.log("[FIDE Sync] Parsing XML file:", files[0]);

    // ─── Step 3: Stream Parse XML & Filter ─────────────────────────────
    console.log("[FIDE Sync] Stream parsing XML file:", files[0]);
    const sax = await import("sax");
    const ugandaPlayers: any[] = [];
    
    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream(xmlPath, { encoding: "utf-8" });
      const saxStream = sax.createStream(true, { trim: true });

      let currentPlayer: any = null;
      let currentTag: string | null = null;

      saxStream.on("opentag", (node: any) => {
        if (node.name === "player") {
          currentPlayer = {};
        }
        currentTag = node.name;
      });

      saxStream.on("text", (text: string) => {
        if (currentPlayer && currentTag && currentTag !== "player") {
          currentPlayer[currentTag] = text;
        }
      });

      saxStream.on("closetag", (tagName: string) => {
        if (tagName === "player") {
          if (currentPlayer && currentPlayer.country === TARGET_COUNTRY) {
            ugandaPlayers.push(currentPlayer);
          }
          currentPlayer = null;
        }
        currentTag = null;
      });

      saxStream.on("end", () => resolve());
      saxStream.on("error", reject);

      stream.pipe(saxStream);
    });

    console.log(`[FIDE Sync] ${TARGET_COUNTRY} players found: ${ugandaPlayers.length}`);

    if (ugandaPlayers.length === 0) {
      throw new Error(`No players found for country code: ${TARGET_COUNTRY}`);
    }

    // ─── Step 5: Upsert into database ──────────────────────────────────
    const now = new Date();
    let upsertCount = 0;

    // Process in batches of 50 to avoid overwhelming SQLite
    const BATCH_SIZE = 50;
    for (let i = 0; i < ugandaPlayers.length; i += BATCH_SIZE) {
      const batch = ugandaPlayers.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (p: any) => {
          const fideId = parseInt(p.fideid, 10);
          if (isNaN(fideId)) return;

          await prisma.fidePlayer.upsert({
            where: { fideId },
            update: {
              name: String(p.name || ""),
              country: String(p.country || ""),
              sex: p.sex ? String(p.sex) : null,
              title: p.title ? String(p.title) : null,
              rating: parseInt(p.rating, 10) || 0,
              games: parseInt(p.games, 10) || 0,
              kFactor: parseInt(p.k, 10) || 0,
              rapidRating: parseInt(p.rapid_rating, 10) || 0,
              rapidGames: parseInt(p.rapid_games, 10) || 0,
              blitzRating: parseInt(p.blitz_rating, 10) || 0,
              blitzGames: parseInt(p.blitz_games, 10) || 0,
              birthday: p.birthday ? parseInt(p.birthday, 10) || null : null,
              flag: p.flag ? String(p.flag) : null,
              syncedAt: now,
            },
            create: {
              fideId,
              name: String(p.name || ""),
              country: String(p.country || ""),
              sex: p.sex ? String(p.sex) : null,
              title: p.title ? String(p.title) : null,
              rating: parseInt(p.rating, 10) || 0,
              games: parseInt(p.games, 10) || 0,
              kFactor: parseInt(p.k, 10) || 0,
              rapidRating: parseInt(p.rapid_rating, 10) || 0,
              rapidGames: parseInt(p.rapid_games, 10) || 0,
              blitzRating: parseInt(p.blitz_rating, 10) || 0,
              blitzGames: parseInt(p.blitz_games, 10) || 0,
              birthday: p.birthday ? parseInt(p.birthday, 10) || null : null,
              flag: p.flag ? String(p.flag) : null,
              syncedAt: now,
            },
          });
          upsertCount++;
        })
      );
    }

    // ─── Step 6: Log the sync ──────────────────────────────────────────
    const currentDate = new Date();
    const period = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

    await prisma.fideSyncLog.create({
      data: {
        period,
        totalRows: upsertCount,
        status: "SUCCESS",
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[FIDE Sync] ✅ Complete! ${upsertCount} players synced in ${elapsed}s`);

    return NextResponse.json({
      success: true,
      message: `Synced ${upsertCount} ${TARGET_COUNTRY} players from official FIDE data.`,
      period,
      totalPlayers: upsertCount,
      elapsedSeconds: parseFloat(elapsed),
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[FIDE Sync] ❌ Failed:", errorMessage);

    // Log the failure
    try {
      await prisma.fideSyncLog.create({
        data: {
          period: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
          totalRows: 0,
          status: "FAILED",
          error: errorMessage,
        },
      });
    } catch {
      // Don't let logging failure mask the original error
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );

  } finally {
    // ─── Cleanup temp files ──────────────────────────────────────────
    try {
      if (existsSync(tmpDir)) {
        rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch {
      // Cleanup is best-effort
    }
  }
}

/**
 * GET /api/fide/sync
 * 
 * Returns the latest sync status for display in the admin console.
 */
export async function GET() {
  try {
    const latestSync = await prisma.fideSyncLog.findFirst({
      orderBy: { syncedAt: "desc" },
    });

    const totalPlayers = await prisma.fidePlayer.count({
      where: { country: TARGET_COUNTRY },
    });

    return NextResponse.json({
      lastSync: latestSync,
      totalPlayersInDb: totalPlayers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}
