/**
 * Resilient Dynamic Live Chess-Results Scraper
 * 
 * Fetches and parses raw HTML from chess-results.com dynamically.
 * Features auto-header detection and dynamic mirror redirect-following.
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
  tiebreaks?: Record<string, number | string>;
  // Team / League specific fields
  isTeam?: boolean;
  matchPoints?: number;
  gamePoints?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  played?: number;
}

export interface ScrapedStandingsPayload {
  formatType: "INDIVIDUAL" | "TEAM_LEAGUE";
  tbHeaders: string[];
  players: ScrapedPlayer[];
}

export interface ScrapedPairing {
  table: number;
  whiteName: string;
  whiteRating: number;
  blackName: string;
  blackRating: number;
  result: string;
  // Team Match pairing specific fields
  isMatch?: boolean;
  matchResult?: string;
  boardPairings?: ScrapedPairing[];
}

export interface ScrapedRosterPlayer {
  startingRank: number;
  name: string;
  rating: number;
  title: string | null;
  federation: string;
  fideId: string | null;
  // Team specific fields
  teamName?: string;
  boardNumber?: number;
  points?: number;
  games?: number;
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
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
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
 * Robust fetch wrapper that recursively follows Chess-Results mirror redirects
 */
async function fetchWithRedirect(url: string, depth = 0): Promise<string> {
  if (depth > 5) throw new Error("Too many redirects on Chess-Results server mirrors");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
  });
  
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status} when requesting ${url}`);
  }

  const text = await res.text();

  // Handle Chess-Results "Object moved" redirects manually
  if (text.includes("Object moved to") || text.includes("Object moved")) {
    const urlMatch = text.match(/href="([^"]+)"/i);
    if (urlMatch) {
      let redirectUrl = urlMatch[1].replace(/&amp;/g, "&");
      
      // Prepend domain if relative
      if (redirectUrl.startsWith("/")) {
        redirectUrl = "https://chess-results.com" + redirectUrl;
      }
      
      return fetchWithRedirect(redirectUrl, depth + 1);
    }
  }

  return text;
}

/**
 * Scrapes all tournaments listed on the Chess-Results Uganda Federation page
 */
export async function scrapeUGAFederationTournaments(): Promise<ScrapedFederationTournament[]> {
  const url = `https://chess-results.com/fed.aspx?lan=1&fed=UGA`;
  const html = await fetchWithRedirect(url);

  const tournaments: ScrapedFederationTournament[] = [];
  const seenIds = new Set<string>();

  // Match table rows
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  const now = new Date();

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const linkMatch = rowHtml.match(/href="?\/?[^"'>]*tnr(\d+)\.aspx[^"'>]*"?[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const id = linkMatch[1];
    const name = cleanText(linkMatch[2]);

    if (id && name && !seenIds.has(id)) {
      if (name.toLowerCase().includes("view more") || name.toLowerCase().includes("details")) continue;

      seenIds.add(id);

      // Extract cells to find dates
      const cells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      const cleanCells = cells.map(c => cleanText(c));

      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;
      let isActive = false;

      // Scan cells for date patterns like YYYY/MM/DD or DD.MM.YYYY
      for (const cell of cleanCells) {
        const dateMatch = cell.match(/(\d{4}\/\d{1,2}\/\d{1,2})|(\d{1,2}\.\d{1,2}\.\d{4})/g);
        if (dateMatch && dateMatch.length > 0) {
          const parseDateStr = (d: string) => {
            if (d.includes('/')) return new Date(d);
            const parts = d.split('.');
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          };

          const d1 = parseDateStr(dateMatch[0]);
          startDate = !isNaN(d1.getTime()) ? d1.toISOString() : undefined;

          if (dateMatch.length > 1) {
            const d2 = parseDateStr(dateMatch[1]);
            endDate = !isNaN(d2.getTime()) ? d2.toISOString() : startDate;
          } else {
            endDate = startDate;
          }

          if (startDate && endDate) {
            const s = new Date(startDate);
            const e = new Date(endDate);
            e.setHours(23, 59, 59, 999);
            if (now >= s && now <= e) {
              isActive = true;
            }
          }
          break;
        }
      }

      tournaments.push({ id, name, startDate, endDate, isActive });
    }
  }

  return tournaments;
}

export async function scrapeTournamentDetails(tournamentId: string): Promise<ScrapedTournamentDetails> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1`;
  const html = await fetchWithRedirect(url);

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

export async function scrapeStandings(tournamentId: string, round?: number, art = 63): Promise<ScrapedStandingsPayload> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1&art=${art}${round ? `&rd=${round}` : ""}`;
  const html = await fetchWithRedirect(url);

  const tableRegex = /<table[^>]*class="[^"]*(?:desc_table|CRs\d+)[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) {
    if (art === 63) return scrapeStandings(tournamentId, round, 46);
    if (art === 46) return scrapeStandings(tournamentId, round, 0);
    if (art === 0) return scrapeStandings(tournamentId, round, 1);
    return { formatType: "INDIVIDUAL", tbHeaders: [], players: [] };
  }

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let headers: string[] = [];
  let rawHeaders: string[] = [];
  const players: ScrapedPlayer[] = [];
  let formatType: "INDIVIDUAL" | "TEAM_LEAGUE" = art === 63 || art === 46 ? "TEAM_LEAGUE" : "INDIVIDUAL";

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
    if (cells.length === 0) continue;

    const cleanCells = cells.map(c => cleanText(c));
    const normalizedCells = cleanCells.map(c => c.replace(/,/g, "."));
    const isHeaderRow = cleanCells.some(c => c.toLowerCase() === "rk." || c.toLowerCase() === "snr" || c.toLowerCase().includes("name") || c.toLowerCase().includes("team") || c.toLowerCase().includes("club") || c.toLowerCase().includes("mannschaft") || c.toLowerCase().includes("tisch") || c.toLowerCase().includes("table"));
    
    if (isHeaderRow && headers.length === 0) {
      rawHeaders = cleanCells.map(h => h.replace(/&nbsp;/g, "").trim());
      headers = rawHeaders.map(h => h.toLowerCase().replace(/[\s_.]/g, ""));
      if (headers.some(h => h === "mp" || h === "bp" || h.includes("team") || h.includes("club") || h.includes("mannschaft") || h === "matchpts" || h.includes("match"))) {
        formatType = "TEAM_LEAGUE";
      }
      continue;
    }

    if (headers.length === 0) continue;

    const rkIdx = headers.findIndex(h => h === "rk" || h === "rank" || h === "snr" || h === "rg" || h === "nr");
    const snoIdx = headers.findIndex(h => h === "sno" || h.includes("start") || h === "snr" || h === "nr");
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("team") || h.includes("club") || h.includes("player") || h.includes("mannschaft") || h.includes("weib") || h.includes("weiss") || h.includes("white"));
    const rtgIdx = headers.findIndex(h => h.includes("rtg") || h.includes("rating") || h.includes("elo"));
    const fedIdx = headers.findIndex(h => h === "fed" || h === "country");

    const name = nameIdx !== -1 ? cleanCells[nameIdx] : "";
    if (!name || name.toLowerCase().includes("total")) continue;

    const rank = rkIdx !== -1 ? parseInt(cleanCells[rkIdx], 10) : players.length + 1;
    const startingRank = snoIdx !== -1 ? parseInt(cleanCells[snoIdx], 10) : rank;
    const rating = rtgIdx !== -1 ? parseInt(cleanCells[rtgIdx], 10) || 1200 : 1200;
    const federation = fedIdx !== -1 ? cleanCells[fedIdx] || "UGA" : "UGA";

    if (formatType === "TEAM_LEAGUE") {
      const mpIdx = headers.findIndex(h => h === "mp" || h === "matchpts" || h === "matchpoints" || h.includes("match") || h === "tb1" || h === "pts" || h === "points" || h.includes("pkte"));
      const bpIdx = headers.findIndex(h => h === "bp" || h === "boardpts" || h === "boardpoints" || h === "tb2" || h.includes("board") || h.includes("brett"));
      const wonIdx = headers.findIndex(h => h === "+");
      const drawnIdx = headers.findIndex(h => h === "=");
      const lostIdx = headers.findIndex(h => h === "-");
      const playedIdx = headers.findIndex(h => h === "p" || h === "games" || h === "played" || h.includes("part"));

      const matchPoints = mpIdx !== -1 ? parseFloat(normalizedCells[mpIdx]) || 0.0 : 0.0;
      const gamePoints = bpIdx !== -1 ? parseFloat(normalizedCells[bpIdx]) || 0.0 : 0.0;
      const won = wonIdx !== -1 ? parseInt(cleanCells[wonIdx], 10) || 0 : 0;
      const drawn = drawnIdx !== -1 ? parseInt(cleanCells[drawnIdx], 10) || 0 : 0;
      const lost = lostIdx !== -1 ? parseInt(cleanCells[lostIdx], 10) || 0 : 0;
      const played = playedIdx !== -1 ? parseInt(cleanCells[playedIdx], 10) || (won + drawn + lost) : (won + drawn + lost);

      const tiebreaks: Record<string, number | string> = {};
      headers.forEach((h, i) => {
        if (i > nameIdx && i !== mpIdx && i !== bpIdx && i !== wonIdx && i !== drawnIdx && i !== lostIdx && i !== playedIdx && i !== rtgIdx && i !== fedIdx) {
          const lbl = rawHeaders[i] || h.toUpperCase();
          tiebreaks[lbl] = parseFloat(normalizedCells[i]) || cleanCells[i];
        }
      });

      players.push({
        rank,
        startingRank,
        name,
        rating,
        federation,
        points: matchPoints,
        isTeam: true,
        matchPoints,
        gamePoints,
        won,
        drawn,
        lost,
        played,
        tiebreaks
      });
    } else {
      const ptsIdx = headers.findIndex(h => h.includes("pts") || h.includes("points") || h === "tb1" || h.includes("pkte"));
      const points = ptsIdx !== -1 ? parseFloat(normalizedCells[ptsIdx]) || 0.0 : 0.0;

      const tiebreaks: Record<string, number | string> = {};
      headers.forEach((h, i) => {
        if (i > ptsIdx && i !== rtgIdx && i !== fedIdx && !h.includes("fide") && h !== "k") {
          const lbl = rawHeaders[i] || h.toUpperCase();
          tiebreaks[lbl] = parseFloat(normalizedCells[i]) || cleanCells[i];
        }
      });

      let tiebreak1: number | undefined;
      let tiebreak2: number | undefined;
      const tiebreakIndexes = headers.map((h, i) => (i > ptsIdx && (h.includes("tb") || h.includes("buc") || h.includes("dir") || h.includes("son")) ? i : -1)).filter(i => i !== -1);
      if (tiebreakIndexes.length > 0) tiebreak1 = parseFloat(normalizedCells[tiebreakIndexes[0]]) || undefined;
      if (tiebreakIndexes.length > 1) tiebreak2 = parseFloat(normalizedCells[tiebreakIndexes[1]]) || undefined;

      players.push({
        rank,
        startingRank,
        name,
        rating,
        federation,
        points,
        tiebreak1,
        tiebreak2,
        tiebreaks
      });
    }
  }

  let tbHeaders: string[] = [];
  if (players.length > 0 && players[0].tiebreaks) {
    tbHeaders = Object.keys(players[0].tiebreaks);
  }

  if (players.length === 0) {
    if (art === 63) return scrapeStandings(tournamentId, round, 46);
    if (art === 46) return scrapeStandings(tournamentId, round, 0);
    if (art === 0) return scrapeStandings(tournamentId, round, 1);
  }

  return { formatType, tbHeaders, players };
}

export async function scrapeRoster(tournamentId: string, art = 33): Promise<ScrapedRosterPlayer[]> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1&art=${art}`;
  const html = await fetchWithRedirect(url);

  const tableRegex = /<table[^>]*class="[^"]*(?:desc_table|CRs\d+)[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) {
    if (art === 33) return scrapeRoster(tournamentId, 16);
    if (art === 16) return scrapeRoster(tournamentId, 0);
    return [];
  }

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let headers: string[] = [];
  const roster: ScrapedRosterPlayer[] = [];
  let currentTeamName = "";

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
    if (cells.length === 0) continue;

    const cleanCells = cells.map(c => cleanText(c));

    if (cleanCells.length === 1 || rowHtml.includes("colspan") || (cleanCells.length > 1 && (cleanCells[0].toLowerCase().includes("team") || cleanCells[0].toLowerCase().includes("mannschaft")))) {
      const possibleTeam = cleanCells.find(c => c.length > 2 && !c.toLowerCase().includes("sno") && !c.toLowerCase().includes("snr") && !c.toLowerCase().includes("name"));
      if (possibleTeam) {
        currentTeamName = possibleTeam;
        continue;
      }
    }

    const isHeaderRow = cleanCells.some(c => c.toLowerCase() === "sno" || c.toLowerCase() === "snr" || c.toLowerCase().includes("name") || c.toLowerCase() === "bo." || c.toLowerCase() === "tisch" || c.toLowerCase() === "table");
    if (isHeaderRow && headers.length === 0) {
      headers = cleanCells.map(h => h.toLowerCase().replace(/[\s_.]/g, ""));
      continue;
    }

    if (headers.length === 0) continue;

    const snoIdx = headers.findIndex(h => h === "sno" || h.includes("start") || h.includes("no") || h === "snr");
    const boIdx = headers.findIndex(h => h === "bo" || h === "board" || h === "br" || h === "table" || h === "tisch");
    const titleIdx = headers.findIndex(h => h === "title" || h === "tit");
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("player") || h.includes("mannschaft"));
    const rtgIdx = headers.findIndex(h => h === "rtg" || h === "rating" || h === "elo");
    const fedIdx = headers.findIndex(h => h === "fed" || h === "country");
    const fideIdIdx = headers.findIndex(h => h.includes("fideid") || h.includes("fideno") || h === "id");
    const ptsIdx = headers.findIndex(h => h.includes("pts") || h.includes("point") || h.includes("pkte") || h.includes("score") || h === "p" || h === "p.");
    const gamesIdx = headers.findIndex(h => h.includes("game") || h.includes("play") || h.includes("part") || h === "g" || h === "p" || h === "p.");

    const name = nameIdx !== -1 ? cleanCells[nameIdx] : "";
    if (!name) continue;

    const startingRank = snoIdx !== -1 ? parseInt(cleanCells[snoIdx], 10) : roster.length + 1;
    const boardNumber = boIdx !== -1 ? parseInt(cleanCells[boIdx], 10) || undefined : undefined;
    const title = titleIdx !== -1 && cleanCells[titleIdx] ? cleanCells[titleIdx] : null;
    const rating = rtgIdx !== -1 ? parseInt(cleanCells[rtgIdx], 10) || 1200 : 1200;
    const federation = fedIdx !== -1 ? cleanCells[fedIdx] || "UGA" : "UGA";
    const fideId = fideIdIdx !== -1 && /^\d+$/.test(cleanCells[fideIdIdx]) ? cleanCells[fideIdIdx] : null;
    const points = ptsIdx !== -1 ? parseFloat(cleanCells[ptsIdx].replace(/,/g, '.')) || 0 : undefined;
    const games = gamesIdx !== -1 ? parseInt(cleanCells[gamesIdx], 10) || undefined : undefined;

    roster.push({
      startingRank,
      name,
      rating,
      title,
      federation,
      fideId,
      teamName: currentTeamName || undefined,
      boardNumber,
      points,
      games
    });
  }

  if (roster.length === 0) {
    if (art === 33) return scrapeRoster(tournamentId, 16);
    if (art === 16) return scrapeRoster(tournamentId, 0);
  }

  return roster;
}

export async function scrapePairings(tournamentId: string, round: number, art = 2): Promise<ScrapedPairing[]> {
  const url = `https://chess-results.com/tnr${tournamentId}.aspx?lan=1&art=${art}&rd=${round}`;
  const html = await fetchWithRedirect(url);

  const tableRegex = /<table[^>]*class="[^"]*(?:desc_table|CRs\d+)[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) {
    if (art === 2) return scrapePairings(tournamentId, round, 4);
    return [];
  }

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

    if (art === 3) {
      if (cleanCells.length >= 8 && /^\d+\.\d+$/.test(cleanCells[0])) {
        const tableStr = cleanCells[0].split('.')[0];
        const table = parseInt(tableStr, 10) || pairings.length + 1;
        
        const whiteName = cleanCells[2];
        const whiteRating = parseInt(cleanCells[3], 10) || 1200;
        const blackName = cleanCells[6];
        const blackRating = parseInt(cleanCells[7], 10) || 1200;
        const result = cleanCells[8] || "v";
        
        if (whiteName && blackName) {
          pairings.push({ table, whiteName, whiteRating, blackName, blackRating, result });
        }
      }
      continue;
    }

    const isHeaderRow = cleanCells.some(c => c.toLowerCase() === "br." || c.toLowerCase() === "board" || c.toLowerCase() === "bo." || c.toLowerCase() === "table" || c.toLowerCase() === "tisch" || c.toLowerCase() === "snr" || c.toLowerCase() === "nr." || c.toLowerCase().includes("white") || c.toLowerCase().includes("mannschaft") || c.toLowerCase().includes("team"));
    
    if (isHeaderRow && headers.length === 0) {
      headers = cleanCells.map(h => h.toLowerCase().replace(/[\s_.]/g, ""));
      continue;
    }

    if (headers.length === 0) continue;

    const boardIdx = headers.findIndex(h => h === "br" || h === "board" || h === "bo" || h === "table" || h === "tisch" || h === "snr" || h === "nr");
    
    const nameIndexes: number[] = [];
    headers.forEach((h, i) => {
      if (h.includes("name") || h.includes("player") || h.includes("team") || h.includes("club") || h.includes("white") || h.includes("black") || h.includes("mannschaft") || h.includes("weib") || h.includes("weiss") || h.includes("schwarz")) {
        nameIndexes.push(i);
      }
    });

    const rtgIndexes: number[] = [];
    headers.forEach((h, i) => {
      if (h === "rtg" || h === "rating" || h === "elo") rtgIndexes.push(i);
    });

    const resIdx = headers.findIndex(h => h === "-" || h === "res" || h === "result" || h.includes("score") || h.includes("res") || h === "erg" || h.includes("erg"));

    const whiteName = nameIndexes.length > 0 ? cleanCells[nameIndexes[0]] : "";
    const blackName = nameIndexes.length > 1 ? cleanCells[nameIndexes[1]] : "";
    if (!whiteName) continue;

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

  if (pairings.length === 0) {
    if (art === 2) return scrapePairings(tournamentId, round, 4);
  }

  if (art === 2 && pairings.length > 0) {
    try {
      const boardPairings = await scrapePairings(tournamentId, round, 3);
      pairings.forEach(match => {
        match.isMatch = true;
        match.matchResult = match.result;
        match.boardPairings = boardPairings.filter(bp => bp.table === match.table);
      });
    } catch (err) {
      // Ignore if board pairings fail
    }
  }

  return pairings;
}
