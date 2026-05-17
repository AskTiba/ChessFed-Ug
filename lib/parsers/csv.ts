/**
 * Universal CSV/TSV Tournament Spreadsheet Parser
 * 
 * Parses standard tabular tournament roster/standings sheets exported 
 * from Excel, Google Sheets, or Chess-Results tables.
 */

export interface CSVPlayer {
  rank: number;
  name: string;
  rating: number;
  federation: string;
  fideId: string | null;
  points: number;
  games: { round: number; opponentRank: number | null; result: "1" | "0" | "0.5" | null }[];
}

export interface CSVTournament {
  name: string;
  players: CSVPlayer[];
}

export function parseCSV(fileContent: string): CSVTournament {
  // Detect line splits and column separator (comma vs tab)
  const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error("Empty file content");
  }

  // Detect separator: Tab for copy-pasted spreadsheets (TSV), Comma for CSV
  const firstLine = lines[0];
  const isTSV = firstLine.includes("\t");
  const separator = isTSV ? "\t" : ",";

  const rows = lines.map(line => {
    // Basic CSV splitting (handling quoted names optionally if standard CSV)
    if (!isTSV) {
      // Split by commas not inside double quotes
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (matches) {
        return matches.map(m => m.replace(/^"|"$/g, "").trim());
      }
    }
    return line.split(separator).map(col => col.trim());
  });

  // Find header row: look for row containing 'name' or 'player' or 'rating'
  let headerIndex = 0;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i];
    const hasName = row.some(col => col.toLowerCase().includes("name") || col.toLowerCase().includes("player"));
    const hasRating = row.some(col => col.toLowerCase().includes("rating") || col.toLowerCase().includes("elo"));
    if (hasName || hasRating) {
      headerIndex = i;
      headers = row.map(h => h.toLowerCase().replace(/[\s_]/g, ""));
      break;
    }
  }

  // If no header found, assume row 0 is header
  if (headers.length === 0) {
    headers = rows[0].map(h => h.toLowerCase().replace(/[\s_]/g, ""));
    headerIndex = 0;
  }

  // Map header indexes
  const rankIdx = headers.findIndex(h => h.includes("rank") || h === "rk" || h === "no" || h === "sn");
  const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("player"));
  const ratingIdx = headers.findIndex(h => h.includes("rating") || h.includes("elo") || h.includes("rtg"));
  const fedIdx = headers.findIndex(h => h.includes("fed") || h.includes("cty") || h.includes("country"));
  const fideIdIdx = headers.findIndex(h => h.includes("fideid") || h.includes("fideno") || h === "id");
  const pointsIdx = headers.findIndex(h => h.includes("pts") || h.includes("points") || h === "score");

  // Dynamically identify round columns (e.g. "rd1", "round1", "r1", "rd.1")
  const roundCols: { roundNum: number; index: number }[] = [];
  headers.forEach((h, idx) => {
    const rdMatch = h.match(/^(?:rd|round|r)(\d+)$/i);
    if (rdMatch) {
      roundCols.push({ roundNum: parseInt(rdMatch[1], 10), index: idx });
    }
  });

  const players: CSVPlayer[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    // Skip empty lines or total summaries
    const name = nameIdx !== -1 ? row[nameIdx] : "";
    if (!name || name.toLowerCase().includes("total") || name.toLowerCase().includes("sum")) continue;

    const rank = rankIdx !== -1 ? parseInt(row[rankIdx], 10) : i - headerIndex;
    const rating = ratingIdx !== -1 ? parseInt(row[ratingIdx], 10) || 1200 : 1200;
    const federation = fedIdx !== -1 ? row[fedIdx] || "UGA" : "UGA";
    const fideIdRaw = fideIdIdx !== -1 ? row[fideIdIdx] : null;
    const fideId = fideIdRaw && /^\d+$/.test(fideIdRaw) ? fideIdRaw : null;
    const points = pointsIdx !== -1 ? parseFloat(row[pointsIdx]) || 0 : 0;

    // Parse round pairings & scores
    const games: CSVPlayer["games"] = [];
    roundCols.forEach(({ roundNum, index }) => {
      const cellVal = row[index] || "";
      if (!cellVal) return;

      // Excel formats for matches are usually like "22w1" or "22 w 1" or "22 +"
      // Parse opponent rank and result
      const numMatch = cellVal.match(/\d+/);
      const opponentRank = numMatch ? parseInt(numMatch[0], 10) : null;

      let result: "1" | "0" | "0.5" | null = null;
      if (cellVal.includes("1") || cellVal.includes("+")) result = "1";
      else if (cellVal.includes("0") || cellVal.includes("-")) result = "0";
      else if (cellVal.includes("0.5") || cellVal.includes("½") || cellVal.includes("=") || cellVal.includes("1/2")) result = "0.5";

      games.push({
        round: roundNum,
        opponentRank,
        result,
      });
    });

    players.push({
      rank,
      name,
      rating,
      federation,
      fideId,
      points,
      games,
    });
  }

  // Return a generic name, we will get the real tournament name from input or sheet name
  return {
    name: "CSV Tournament Import",
    players,
  };
}
