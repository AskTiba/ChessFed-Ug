// --- REFINED PLAYER BASE ---
export const MOCK_PLAYERS = [
  { id: "p1", name: "FM Harold Wanyama", fideId: "1000001", rating: 2380, federation: "UGA", clubId: "c1" },
  { id: "p2", name: "IM Arthur Ssegwanyi", fideId: "1000002", rating: 2420, federation: "UGA", clubId: "c2" },
  { id: "p3", name: "FM Patrick Kawuma", fideId: "1000003", rating: 2310, federation: "UGA", clubId: "c1" },
  { id: "p4", name: "WFM Shakira Ampaire", fideId: "1000004", rating: 2050, federation: "UGA", clubId: "c3" },
  { id: "p5", name: "Emanuel Egesa", fideId: "1000005", rating: 2100, federation: "UGA", clubId: "c2" },
  ...Array.from({ length: 240 }, (_, i) => ({
    id: `p${i + 6}`,
    name: `Master ${i + 6}`,
    fideId: (1000006 + i).toString(),
    rating: 2100 - i * 5,
    federation: "UGA",
    clubId: `c${(i % 20) + 1}` // evenly distributing to 20 clubs
  }))
];

// --- 20+ UGANDAN CLUBS ---
export const MOCK_CLUBS = [
  { id: "c1", name: "Kireka Chess Club", owner: "Kireka Sports Org", captain: "FM Harold Wanyama", founded: 1995, description: "The most dominant club in Ugandan history.", logo: "/clubs/kireka.png" },
  { id: "c2", name: "City Chess Club", owner: "Kampala City Council", captain: "IM Arthur Ssegwanyi", founded: 2010, description: "A top-tier club representing the heart of Kampala.", logo: "/clubs/city.png" },
  { id: "c3", name: "SOM Katwe", owner: "Robert Katende", captain: "WFM Shakira Ampaire", founded: 2012, description: "Famous for nurturing the Queen of Katwe.", logo: "/clubs/som.png" },
  { id: "c4", name: "Doves Chess Club", owner: "Uganda Air Force", captain: "Sgt. Mulasa", founded: 2005, description: "Highly disciplined and competitive team.", logo: "/clubs/doves.png" },
  // ... adding 16 more clubs to reach 20
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `c${i + 5}`,
    name: `Club ${i + 5} Chess Club`,
    owner: `Owner ${i + 5}`,
    captain: `Captain ${i + 5}`,
    founded: 2000 + i,
    description: `A competitive club founded in ${2000 + i}.`,
    logo: null
  }))
];

// --- NATIONAL LEAGUE STANDINGS ---
export const MOCK_LEAGUE_STANDINGS = [
  { rank: 1, clubId: "c1", name: "Kireka Chess Club", matchPoints: 12, gamePoints: 42.5 },
  { rank: 2, clubId: "c2", name: "City Chess Club", matchPoints: 10, gamePoints: 38.0 },
  { rank: 3, clubId: "c4", name: "Doves Chess Club", matchPoints: 9, gamePoints: 35.5 },
  { rank: 4, clubId: "c3", name: "SOM Katwe", matchPoints: 7, gamePoints: 28.0 },
];

// --- TOURNAMENT PODIUM HISTORY (ARCHIVE) ---
export const MOCK_PODIUMS = [
  { 
    tournamentId: "t1", 
    year: 2024, 
    podium: [
      { rank: 1, name: "FM Harold Wanyama", rating: 2380 },
      { rank: 2, name: "IM Arthur Ssegwanyi", rating: 2410 },
      { rank: 3, name: "Emanuel Egesa", rating: 2080 }
    ]
  },
  { 
    tournamentId: "t1", 
    year: 2023, 
    podium: [
      { rank: 1, name: "IM Arthur Ssegwanyi", rating: 2420 },
      { rank: 2, name: "FM Harold Wanyama", rating: 2390 },
      { rank: 3, name: "FM Patrick Kawuma", rating: 2320 }
    ]
  }
];

// --- TOURNAMENTS WITH HISTORY ---
export const MOCK_TOURNAMENTS = [
  {
    id: "t1",
    name: "Uganda National Championship",
    description: "The flagship event of Ugandan chess.",
    history: "Founded in 1978 by Dr. V. Kakumba, this event defines the national champion. It has traditionally been hosted at Lugogo Indoor Stadium.",
    startDate: new Date("2026-06-15"),
    endDate: new Date("2026-06-20"),
    registrationDeadline: new Date("2026-06-01"),
    registrationFee: 50000,
    prizeFund: 5000000,
    venue: "Kira Road Arena, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true,
    sponsors: [{ name: "MTN Uganda" }, { name: "NCS" }],
    officials: [{ name: "IA Stephen Kisuze", role: "Chief Arbiter" }],
    _count: { players: 45 },
    archives: [2024, 2023, 2022, 2021]
  },
  // ... other tournaments
  {
    id: "t2",
    name: "K Rwabushenyi Memorial",
    description: "In memory of the late K. Rwabushenyi.",
    history: "A premier memorial open attracting international masters, started in the early 2000s.",
    startDate: new Date("2026-12-05"),
    endDate: new Date("2026-12-10"),
    registrationDeadline: new Date("2026-11-25"),
    registrationFee: 30000,
    prizeFund: 3500000,
    venue: "Hotel Africana",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true,
    sponsors: [{ name: "Stanbic Bank" }],
    officials: [{ name: "NA Christopher Turyahabwe", role: "Arbiter" }],
    _count: { players: 120 },
    archives: [2024, 2023, 2022]
  }
];

export const MOCK_GP_POINTS = [
  { id: "gp1", playerId: "p1", points: 10, tournamentId: "t1", tournament: { name: "Uganda National Championship", startDate: new Date("2026-06-15") } },
  { id: "gp2", playerId: "p2", points: 8, tournamentId: "t1", tournament: { name: "Uganda National Championship", startDate: new Date("2026-06-15") } },
  { id: "gp3", playerId: "p1", points: 10, tournamentId: "t2", tournament: { name: "K Rwabushenyi Memorial", startDate: new Date("2026-12-05") } },
  { id: "gp4", playerId: "p2", points: 10, tournamentId: "t2", tournament: { name: "K Rwabushenyi Memorial", startDate: new Date("2026-12-05") } },
];

export const MOCK_PAIRINGS = [
  { table: 1, white: "FM Harold Wanyama", black: "IM Arthur Ssegwanyi", result: "1/2-1/2", round: 4 },
  { table: 2, white: "FM Patrick Kawuma", black: "Emanuel Egesa", result: "1-0", round: 4 },
];

export const MOCK_STANDINGS = [
  { rank: 1, name: "FM Harold Wanyama", rating: 2380, score: 3.5, buchholz: 12.5 },
  { rank: 2, name: "IM Arthur Ssegwanyi", rating: 2420, score: 3.5, buchholz: 11.0 },
];
