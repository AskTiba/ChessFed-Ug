import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  MOCK_PLAYERS,
  MOCK_TOURNAMENTS,
  MOCK_GP_POINTS,
  MOCK_CLUBS,
  MOCK_LEAGUE_STANDINGS,
} from "../lib/mock-store";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seeding...");

  // Clean the database in correct order
  await prisma.leagueStanding.deleteMany();
  await prisma.grandPrixPoint.deleteMany();
  await prisma.score.deleteMany();
  await prisma.game.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.player.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleaned.");

  // Seed Clubs first
  for (const c of MOCK_CLUBS) {
    await prisma.club.create({
      data: {
        id: c.id,
        name: c.name,
        owner: c.owner,
        captain: c.captain,
        founded: c.founded,
        description: c.description,
        logo: c.logo,
      },
    });
  }
  console.log(`${MOCK_CLUBS.length} clubs seeded.`);

  // Seed Players (linked to clubs)
  for (const p of MOCK_PLAYERS) {
    await prisma.player.create({
      data: {
        id: p.id,
        name: p.name,
        fideId: p.fideId,
        rating: p.rating,
        federation: p.federation,
        clubId: p.clubId,
      },
    });
  }
  console.log(`${MOCK_PLAYERS.length} players seeded.`);

  // Seed League Standings
  for (const s of MOCK_LEAGUE_STANDINGS) {
    await prisma.leagueStanding.create({
      data: {
        rank: s.rank,
        clubId: s.clubId,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        matchPoints: s.matchPoints,
        gamePoints: s.gamePoints,
        tiebreak1: (s as any).tb1 || 0,
        tiebreak2: (s as any).tb2 || 0,
        tiebreak3: (s as any).tb3 || 0,
      },
    });
  }
  console.log(`${MOCK_LEAGUE_STANDINGS.length} league standings seeded.`);

  // Seed Tournaments
  for (const t of MOCK_TOURNAMENTS) {
    await prisma.tournament.create({
      data: {
        id: t.id,
        name: t.name,
        description: t.description,
        history: t.history,
        startDate: t.startDate,
        endDate: t.endDate,
        registrationDeadline: t.registrationDeadline,
        registrationFee: t.registrationFee,
        prizeFund: t.prizeFund,
        venue: t.venue,
        format: t.format,
        totalRounds: t.totalRounds,
        isGrandPrix: t.isGrandPrix,
      },
    });
  }
  console.log(`${MOCK_TOURNAMENTS.length} tournaments seeded.`);

  // Seed Grand Prix Points
  for (const gp of MOCK_GP_POINTS) {
    await prisma.grandPrixPoint.create({
      data: {
        points: gp.points,
        playerId: gp.playerId,
        tournamentId: gp.tournamentId,
      },
    });
  }
  console.log(`${MOCK_GP_POINTS.length} Grand Prix records seeded.`);

  // Create a default Admin User for testing
  // Password is "password123"
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@chessfed.ug",
      password: hashedPassword,
      role: "ADMIN",
    }
  });
  
  await prisma.user.create({
    data: {
      name: "Anthony Ngisiro",
      email: "anthony@example.com",
      password: hashedPassword,
      role: "PLAYER",
      playerId: "p1"
    }
  });

  console.log("Default users created (Pass: password123)");
  console.log("Seeding finished successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
