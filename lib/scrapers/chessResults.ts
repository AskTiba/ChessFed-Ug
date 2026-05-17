/**
 * Zero-Dependency Live Chess-Results Scraper
 * 
 * Fetches and parses raw HTML from chess-results.com dynamically.
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

  const players: ScrapedPlayer[] = [];

  // Find the standings table (usually the table containing "Rk." and "desc_table")
  const tableRegex = /<table[^>]*class="[^"]*desc_table[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let isHeader = true;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    if (isHeader) {
      isHeader = false; // Skip the header row
      continue;
    }

    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 5) continue;

    const rank = parseInt(cleanText(cells[0]), 10);
    const startingRank = parseInt(cleanText(cells[1]), 10) || 1;
    const name = cleanText(cells[2]);
    if (!name || name.toLowerCase().includes("total")) continue;

    const rating = parseInt(cleanText(cells[3]), 10) || 1200;
    const federation = cleanText(cells[4]) || "UGA";
    const points = parseFloat(cleanText(cells[5])) || 0.0;

    let tiebreak1: number | undefined;
    let tiebreak2: number | undefined;
    if (cells.length > 6) tiebreak1 = parseFloat(cleanText(cells[6])) || undefined;
    if (cells.length > 7) tiebreak2 = parseFloat(cleanText(cells[7])) || undefined;

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

  const roster: ScrapedRosterPlayer[] = [];

  const tableRegex = /<table[^>]*class="[^"]*desc_table[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let isHeader = true;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 5) continue;

    const startingRank = parseInt(cleanText(cells[0]), 10);
    if (isNaN(startingRank)) continue;

    const titleRaw = cleanText(cells[1]);
    const title = titleRaw ? titleRaw : null;
    
    const name = cleanText(cells[2]);
    const rating = parseInt(cleanText(cells[3]), 10) || 1200;
    const federation = cleanText(cells[4]) || "UGA";
    
    let fideId: string | null = null;
    if (cells.length > 5) {
      const parsedFide = cleanText(cells[5]);
      if (/^\d+$/.test(parsedFide)) fideId = parsedFide;
    }

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

  const pairings: ScrapedPairing[] = [];

  const tableRegex = /<table[^>]*class="[^"]*desc_table[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let isHeader = true;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 7) continue;

    // Chess-Results Pairings table structure:
    // Col 0: Br. (Table)
    // Col 1: SNo (White starting number)
    // Col 2: Name (White player name)
    // Col 3: Rtg (White rating)
    // Col 4: - (Result separator, e.g. "0 - 1" or "½ - ½")
    // Col 5: SNo (Black starting number)
    // Col 6: Name (Black player name)
    // Col 7: Rtg (Black rating)

    const table = parseInt(cleanText(cells[0]), 10);
    if (isNaN(table)) continue;

    const whiteName = cleanText(cells[2]);
    const whiteRating = parseInt(cleanText(cells[3]), 10) || 1200;
    
    // Result separator is usually in cell 4
    const result = cleanText(cells[4]) || "v";
    
    const blackName = cleanText(cells[6]);
    const blackRating = parseInt(cleanText(cells[7]), 10) || 1200;

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
