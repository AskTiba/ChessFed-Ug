/**
 * Resilient Dynamic Live Chess-Results Scraper
 * 
 * Fetches and parses raw HTML from chess-results.com dynamically.
 * Features auto-header detection for bulletproof parsing of diverse tables.
 */

export interface ScrapedPlayer {
  rank: number;
  startingRank: number;
  name: string;
  rating: number;
  federation: string;
  points: number;
  tiebreak1?: number;
  tiebreak2?: number;
}

export interface ScrapedPairing {
  table: number;
  whiteName: string;
  whiteRating: number;
  blackName: string;
  blackRating: number;
  result: string;
}

export interface ScrapedRosterPlayer {
  startingRank: number;
  name: string;
  rating: number;
  title: string | null;
  federation: string;
  fideId: string | null;
}

export interface ScrapedTournamentDetails {
  id: string;
  name: string;
  organizer: string | null;
  chiefArbiter: string | null;
  location: string | null;
  rounds: number;
}

export interface ScrapedFederationTournament {
  id: string;
  name: string;
  year?: string;
}

// Strip HTML tags and clean up string entities
function cleanText(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "") // strip html tags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Scrapes all tournaments listed on the Chess-Results Uganda Federation page
 */
export async function scrapeUGAFederationTournaments(): Promise<ScrapedFederationTournament[]> {
  const url = `https://chess-results.com/fed.aspx?lan=1&fed=UGA`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load Chess-Results Uganda Federation index");
  const html = await res.text();

  const tournaments: ScrapedFederationTournament[] = [];
  const seenIds = new Set<string>();

  // Regex to find tournament links: <a href="tnr1380546.aspx?lan=1">Tournament Name</a>
  const linkRegex = /<a[^>]*href="tnr(\d+)\.aspx[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const id = match[1];
    const name = cleanText(match[2]);

    if (id && name && !seenIds.has(id)) {
      // Exclude generic links like system navigations
      if (name.toLowerCase().includes("view more") || name.toLowerCase().includes("details")) {
        continue;
      }
      
      seenIds.add(id);
      tournaments.push({ id, name });
    }
  }

  return tournaments;
}

export async function scrapeTournamentDetails(tournamentId: string): Promise<ScrapedTournamentDetails> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load Chess-Results tournament ${tournamentId}`);
  const html = await res.text();

  // Parse Tournament Name
  let name = `Tournament ${tournamentId}`;
  const titleMatch = html.match(/<h2>([\s\S]*?)<\/h2>/i);
  if (titleMatch) {
    name = cleanText(titleMatch[1]);
  }

  // Parse details table
  let organizer: string | null = null;
  let chiefArbiter: string | null = null;
  let location: string | null = null;
  let rounds = 5;

  const rowsRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  while ((match = rowsRegex.exec(html)) !== null) {
    const rowContent = match[1];
    const cells = rowContent.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length >= 2) {
      const key = cleanText(cells[0]).toLowerCase();
      const val = cleanText(cells[1]);

      if (key.includes("organizer")) organizer = val;
      else if (key.includes("arbiter")) chiefArbiter = val;
      else if (key.includes("location") || key.includes("city")) location = val;
      else if (key.includes("rounds")) {
        const parsedRounds = parseInt(val, 10);
        if (!isNaN(parsedRounds)) rounds = parsedRounds;
      }
    }
  }

  return { id: tournamentId, name, organizer, chiefArbiter, location, rounds };
}

export async function scrapeStandings(tournamentId: string): Promise<ScrapedPlayer[]> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1&art=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load standings page");
  const html = await res.text();

  // Find standings table containing headers
  const tableRegex = /<table[^>]*class="[^"]*desc_table[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let headers: string[] = [];
  const players: ScrapedPlayer[] = [];

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
    if (cells.length === 0) continue;

    // Detect header row by scanning for Rank / Name keywords
    const cleanCells = cells.map(c => cleanText(c));
    const isHeaderRow = cleanCells.some(c => c.toLowerCase() === "rk." || c.toLowerCase().includes("name"));
    
    if (isHeaderRow && headers.length === 0) {
      headers = cleanCells.map(h => h.toLowerCase().replace(/[\s_.]/g, ""));
      continue;
    }

    if (headers.length === 0) continue; // Skip rows until we find header

    // Map column values using dynamic headers index
    const rkIdx = headers.findIndex(h => h === "rk" || h === "rank");
    const snoIdx = headers.findIndex(h => h === "sno" || h.includes("start"));
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("player"));
    const rtgIdx = headers.findIndex(h => h === "rtg" || h === "rating" || h === "elo");
    const fedIdx = headers.findIndex(h => h === "fed" || h === "country");
    const ptsIdx = headers.findIndex(h => h === "pts" || h === "points");

    const name = nameIdx !== -1 ? cleanCells[nameIdx] : "";
    if (!name || name.toLowerCase().includes("total")) continue;

    const rank = rkIdx !== -1 ? parseInt(cleanCells[rkIdx], 10) : players.length + 1;
    const startingRank = snoIdx !== -1 ? parseInt(cleanCells[snoIdx], 10) : rank;
    const rating = rtgIdx !== -1 ? parseInt(cleanCells[rtgIdx], 10) || 1200 : 1200;
    const federation = fedIdx !== -1 ? cleanCells[fedIdx] || "UGA" : "UGA";
    const points = ptsIdx !== -1 ? parseFloat(cleanCells[ptsIdx]) || 0.0 : 0.0;

    // Optional tiebreak columns (columns after points)
    let tiebreak1: number | undefined;
    let tiebreak2: number | undefined;
    
    const tiebreakIndexes = headers.map((h, i) => (h.includes("tb") || h.includes("buc") ? i : -1)).filter(i => i !== -1);
    if (tiebreakIndexes.length > 0) tiebreak1 = parseFloat(cleanCells[tiebreakIndexes[0]]) || undefined;
    if (tiebreakIndexes.length > 1) tiebreak2 = parseFloat(cleanCells[tiebreakIndexes[1]]) || undefined;

    players.push({
      rank,
      startingRank,
      name,
      rating,
      federation,
      points,
      tiebreak1,
      tiebreak2,
    });
  }

  return players;
}

export async function scrapeRoster(tournamentId: string): Promise<ScrapedRosterPlayer[]> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1&art=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load roster page");
  const html = await res.text();

  const tableRegex = /<table[^>]*class="[^"]*desc_table[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let headers: string[] = [];
  const roster: ScrapedRosterPlayer[] = [];

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
    if (cells.length === 0) continue;

    const cleanCells = cells.map(c => cleanText(c));
    const isHeaderRow = cleanCells.some(c => c.toLowerCase() === "sno" || c.toLowerCase().includes("name"));
    
    if (isHeaderRow && headers.length === 0) {
      headers = cleanCells.map(h => h.toLowerCase().replace(/[\s_.]/g, ""));
      continue;
    }

    if (headers.length === 0) continue;

    const snoIdx = headers.findIndex(h => h === "sno" || h.includes("start") || h.includes("no"));
    const titleIdx = headers.findIndex(h => h === "title" || h === "tit");
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("player"));
    const rtgIdx = headers.findIndex(h => h === "rtg" || h === "rating" || h === "elo");
    const fedIdx = headers.findIndex(h => h === "fed" || h === "country");
    const fideIdIdx = headers.findIndex(h => h.includes("fideid") || h.includes("fideno") || h === "id");

    const name = nameIdx !== -1 ? cleanCells[nameIdx] : "";
    if (!name) continue;

    const startingRank = snoIdx !== -1 ? parseInt(cleanCells[snoIdx], 10) : roster.length + 1;
    const title = titleIdx !== -1 && cleanCells[titleIdx] ? cleanCells[titleIdx] : null;
    const rating = rtgIdx !== -1 ? parseInt(cleanCells[rtgIdx], 10) || 1200 : 1200;
    const federation = fedIdx !== -1 ? cleanCells[fedIdx] || "UGA" : "UGA";
    const fideId = fideIdIdx !== -1 && /^\d+$/.test(cleanCells[fideIdIdx]) ? cleanCells[fideIdIdx] : null;

    roster.push({
      startingRank,
      title,
      name,
      rating,
      federation,
      fideId,
    });
  }

  return roster;
}

export async function scrapePairings(tournamentId: string, round: number): Promise<ScrapedPairing[]> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1&art=4&rd=${round}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load pairings for round ${round}`);
  const html = await res.text();

  const tableRegex = /<table[^>]*class="[^"]*desc_table[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let headers: string[] = [];
  const pairings: ScrapedPairing[] = [];

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
    if (cells.length === 0) continue;

    const cleanCells = cells.map(c => cleanText(c));
    // Detect pairings headers (e.g. contains "Br" or "Board" or "White" or "Black")
    const isHeaderRow = cleanCells.some(c => c.toLowerCase() === "br." || c.toLowerCase() === "board" || c.toLowerCase().includes("white"));
    
    if (isHeaderRow && headers.length === 0) {
      headers = cleanCells.map(h => h.toLowerCase().replace(/[\s_.]/g, ""));
      continue;
    }

    if (headers.length === 0) continue;

    // Chess-Results Pairings table structure contains two players side-by-side
    // Let's map dynamically:
    // White details: White Name, White Rating
    // Black details: Black Name, Black Rating
    // Board details: Br or Board
    // Result details: usually contains "-" or ":" or matches like "0 - 1"
    
    const boardIdx = headers.findIndex(h => h === "br" || h === "board" || h === "table");
    
    // Find name indices (there are two: White player and Black player)
    const nameIndexes: number[] = [];
    headers.forEach((h, i) => {
      if (h.includes("name") || h.includes("player")) nameIndexes.push(i);
    });

    // Find rating indices
    const rtgIndexes: number[] = [];
    headers.forEach((h, i) => {
      if (h === "rtg" || h === "rating" || h === "elo") rtgIndexes.push(i);
    });

    // Find result separator
    const resIdx = headers.findIndex(h => h === "-" || h.includes("res") || h.includes("score"));

    const whiteName = nameIndexes.length > 0 ? cleanCells[nameIndexes[0]] : "";
    const blackName = nameIndexes.length > 1 ? cleanCells[nameIndexes[1]] : "";
    if (!whiteName) continue; // Empty row

    const table = boardIdx !== -1 ? parseInt(cleanCells[boardIdx], 10) : pairings.length + 1;
    const whiteRating = rtgIndexes.length > 0 ? parseInt(cleanCells[rtgIndexes[0]], 10) || 1200 : 1200;
    const blackRating = rtgIndexes.length > 1 ? parseInt(cleanCells[rtgIndexes[1]], 10) || 1200 : 1200;
    const result = resIdx !== -1 ? cleanCells[resIdx] : "v";

    pairings.push({
      table,
      whiteName,
      whiteRating,
      blackName,
      blackRating,
      result,
    });
  }

  return pairings;
}
