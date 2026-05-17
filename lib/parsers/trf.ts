/**
 * FIDE TRF (Tournament Report File) Parser
 *
 * Implements the official FIDE data exchange standard for chess tournaments.
 * Standard format specifications: https://www.fide.com/FIDE/handbook/C06App2_TRF.pdf
 */

export interface TRFGame {
  round: number;
  opponentRank: number | null;
  color: "w" | "b" | null;
  result: "1" | "0" | "0.5" | null;
}

export interface TRFPlayer {
  rank: number;
  title: string | null;
  name: string;
  rating: number;
  federation: string;
  fideId: string | null;
  birthDate: string | null;
  points: number;
  games: TRFGame[];
}

export interface TRFTournament {
  name: string;
  venue: string | null;
  city: string | null;
  startDate: Date | null;
  endDate: Date | null;
  numberOfRounds: number;
  players: TRFPlayer[];
}

export function parseTRF(fileContent: string): TRFTournament {
  const lines = fileContent.split(/\r?\n/);
  
  let name = "Imported Tournament";
  let venue: string | null = null;
  let city: string | null = null;
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let numberOfRounds = 0;
  const players: TRFPlayer[] = [];

  for (const line of lines) {
    if (line.length < 4) continue;
    const code = line.substring(0, 3);

    // 012: Tournament Name
    if (code === "012") {
      name = line.substring(4).trim();
    }
    // 042: Venue/City
    else if (code === "042") {
      const location = line.substring(4).trim();
      if (location.includes(",")) {
        const parts = location.split(",");
        venue = parts[0].trim();
        city = parts.slice(1).join(",").trim();
      } else {
        venue = location;
      }
    }
    // 052: Start Date (Format: YYYY/MM/DD)
    else if (code === "052") {
      const dateStr = line.substring(4).trim(); // YYYY/MM/DD
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          startDate = date;
        }
      }
    }
    // 062: End Date (Format: YYYY/MM/DD)
    else if (code === "062") {
      const dateStr = line.substring(4).trim();
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          endDate = date;
        }
      }
    }
    // 082: Player Record
    else if (code === "082") {
      try {
        // According to FIDE TRF Layout:
        // Position  Length  Field
        // 1-3       3       Line code (082)
        // 5-8       4       Starting rank number
        // 10-13     4       Title (GM, IM, etc.)
        // 15-47     33      Name
        // 49-56     8       Rating (Standard)
        // 58-60     3       Federation
        // 62-72     11      FIDE ID Number
        // 74-83     10      Birthday/Date of Birth
        // 85-88     4       Points scored
        // 90-       var     Pairings & results round-by-round (8 columns per round: rank(4) color(1) result(1) + 2 spaces spacer)
        
        const rank = parseInt(line.substring(4, 8).trim(), 10);
        if (isNaN(rank)) continue;

        const titleRaw = line.substring(9, 13).trim();
        const title = titleRaw ? titleRaw : null;
        
        const name = line.substring(14, 47).trim();
        
        const rating = parseInt(line.substring(48, 56).trim(), 10) || 1200;
        const federation = line.substring(57, 60).trim() || "UGA";
        
        const fideIdRaw = line.substring(61, 72).trim();
        const fideId = fideIdRaw ? fideIdRaw : null;

        const birthDateRaw = line.substring(73, 83).trim();
        const birthDate = birthDateRaw ? birthDateRaw : null;

        const points = parseFloat(line.substring(84, 88).trim()) || 0.0;

        // Parse round-by-round pairings (starting at col 89/index 89, 8 characters per round: e.g. "   2 w 1  ")
        const games: TRFGame[] = [];
        let roundNum = 1;
        let index = 89;

        while (index < line.length) {
          const roundPart = line.substring(index, index + 8);
          if (roundPart.length < 6) break; // Incomplete round

          const oppRankStr = roundPart.substring(0, 4).trim();
          const colorChar = roundPart.substring(4, 5).trim().toLowerCase(); // w, b, -
          const resChar = roundPart.substring(5, 6).trim(); // 1, 0, =, +, -

          const opponentRank = oppRankStr ? parseInt(oppRankStr, 10) : null;
          
          let color: "w" | "b" | null = null;
          if (colorChar === "w") color = "w";
          else if (colorChar === "b") color = "b";

          let result: "1" | "0" | "0.5" | null = null;
          if (resChar === "1" || resChar === "+") result = "1";
          else if (resChar === "0" || resChar === "-") result = "0";
          else if (resChar === "=" || resChar === "½") result = "0.5";

          // Only record the game if there was an opponent or round activity
          if (opponentRank !== null || color !== null || result !== null) {
            games.push({
              round: roundNum,
              opponentRank,
              color,
              result,
            });
          }

          roundNum++;
          index += 8; // Move to the next round column block
        }

        numberOfRounds = Math.max(numberOfRounds, roundNum - 1);

        players.push({
          rank,
          title,
          name,
          rating,
          federation,
          fideId,
          birthDate,
          points,
          games,
        });
      } catch (err) {
        console.error("Failed to parse TRF player line:", line, err);
      }
    }
  }

  // Fallback defaults
  if (!startDate) startDate = new Date();
  if (!endDate) endDate = new Date();

  return {
    name,
    venue,
    city,
    startDate,
    endDate,
    numberOfRounds,
    players,
  };
}
