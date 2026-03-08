import { MOCK_PLAYERS, MOCK_TOURNAMENTS, MOCK_GP_POINTS, MOCK_CLUBS, MOCK_LEAGUE_STANDINGS, MOCK_PODIUMS } from "./mock-store";

// A minimal mock of the Prisma client for UI Simulation
export const prisma: any = {
  player: {
    findMany: async ({ where, orderBy, take }: any = {}) => {
      let results = [...MOCK_PLAYERS];
      if (where?.clubId) results = results.filter(p => p.clubId === where.clubId);
      if (where?.OR) {
        const query = where.OR[0].name.contains.toLowerCase();
        results = results.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.fideId.toLowerCase().includes(query)
        );
      }
      if (orderBy?.rating === 'desc') results.sort((a, b) => b.rating - a.rating);
      if (take) results = results.slice(0, take);

      return results.map(p => ({
        ...p,
        grandPrixPoints: MOCK_GP_POINTS.filter(gp => gp.playerId === p.id)
      }));
    },
    findUnique: async ({ where }: any) => {
      const p = MOCK_PLAYERS.find(p => p.id === where.id || p.fideId === where.fideId);
      if (!p) return null;
      return {
        ...p,
        grandPrixPoints: MOCK_GP_POINTS.filter(gp => gp.playerId === p.id),
        tournaments: MOCK_TOURNAMENTS.filter(t => t.id === "t1")
      };
    },
    findFirst: async () => MOCK_PLAYERS[0],
    count: async () => MOCK_PLAYERS.length
  },
  club: {
    findMany: async () => MOCK_CLUBS,
    findUnique: async ({ where }: any) => {
      const c = MOCK_CLUBS.find(c => c.id === where.id);
      if (!c) return null;
      return {
        ...c,
        players: MOCK_PLAYERS.filter(p => p.clubId === c.id)
      };
    }
  },
  tournament: {
    findMany: async () => MOCK_TOURNAMENTS,
    findUnique: async ({ where }: any) => {
      const t = MOCK_TOURNAMENTS.find(t => t.id === where.id);
      if (!t) return null;
      return {
        ...t,
        players: MOCK_PLAYERS.slice(0, 5),
        podiums: MOCK_PODIUMS.filter(p => p.tournamentId === t.id)
      };
    },
    update: async ({ where, data }: any) => {
      // Simulation: Return success
      console.log(`Simulated update for tournament ${where.id}`, data);
      return { id: where.id };
    },
    create: async ({ data }: any) => {
      // Simulation: Return success
      console.log("Simulated tournament creation:", data);
      return { id: `t-new-${Date.now()}`, ...data };
    }
  },
  grandPrixPoint: {
    create: async ({ data }: any) => {
      // Simulation: Return success
      console.log("Simulated GP point distribution:", data);
      return { id: `gp-new-${Date.now()}`, ...data };
    }
  },
  user: {
    findUnique: async () => ({
      id: "u1",
      name: "Anthony Ngisiro",
      email: "anthony@example.com",
      playerId: "p1",
      player: {
        ...MOCK_PLAYERS[0],
        grandPrixPoints: MOCK_GP_POINTS.filter(gp => gp.playerId === "p1"),
        tournaments: [MOCK_TOURNAMENTS[0]]
      }
    }),
    findFirst: async () => ({
      id: "u1",
      name: "Anthony Ngisiro",
      email: "anthony@example.com",
      playerId: "p1",
      player: {
        ...MOCK_PLAYERS[0],
        grandPrixPoints: MOCK_GP_POINTS.filter(gp => gp.playerId === "p1"),
        tournaments: [MOCK_TOURNAMENTS[0]]
      }
    }),
    update: async ({ where, data }: any) => {
      // Simulation: Log the update
      console.log(`Simulated user profile update for ${where.email || where.id}`, data);
      return { id: "u1" };
    }
  },
  leagueStanding: {
    findMany: async () => MOCK_LEAGUE_STANDINGS
  }
};
