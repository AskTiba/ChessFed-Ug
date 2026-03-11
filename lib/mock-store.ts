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
  // --- MAJOR CHAMPIONSHIPS ---
  {
    id: "t1",
    name: "Uganda National Chess Championship (Super 12)",
    description: "National Title + Olympiad Team selection. Qualifies for Chess Olympiad 2026 Samarkand.",
    history: "The flagship event defining the national champion. Hosted at Lugogo Indoor Stadium.",
    startDate: new Date("2026-06-15"),
    endDate: new Date("2026-06-20"),
    registrationDeadline: new Date("2026-06-01"),
    registrationFee: 50000,
    prizeFund: 10000000,
    venue: "Lugogo Indoor Stadium, Kampala",
    format: "Round Robin",
    totalRounds: 11,
    isGrandPrix: true,
    sponsors: [{ name: "MTN Uganda" }, { name: "NCS" }],
    officials: [{ name: "IA Stephen Kisuze", role: "Chief Arbiter" }],
    _count: { players: 12 },
    archives: [2024, 2023, 2022, 2021]
  },
  {
    id: "t2",
    name: "Uganda Open Chess Championship",
    description: "Flagship Open (IM norms). Qualifies for Grand Prix Winner.",
    history: "A premier international open attracting masters across East Africa.",
    startDate: new Date("2025-11-10"),
    endDate: new Date("2025-11-15"),
    registrationDeadline: new Date("2025-11-01"),
    registrationFee: 40000,
    prizeFund: 6000000,
    venue: "Hotel Africana",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true,
    sponsors: [{ name: "Stanbic Bank" }],
    officials: [{ name: "NA Christopher Turyahabwe", role: "Arbiter" }],
    _count: { players: 120 },
    archives: [2024, 2023, 2022]
  },
  {
    id: "t3",
    name: "National Schools Team Championship",
    description: "Largest youth event (1100+ kids). Qualifies for National Juniors.",
    history: "The heartbeat of grassroots chess in Uganda.",
    startDate: new Date("2025-05-20"),
    endDate: new Date("2025-05-25"),
    registrationDeadline: new Date("2025-05-10"),
    registrationFee: 10000,
    prizeFund: 0,
    venue: "St. Mary's College Kisubi",
    format: "Team Swiss",
    totalRounds: 7,
    isGrandPrix: false,
    sponsors: [{ name: "City Parents" }],
    officials: [{ name: "NA FA", role: "Organizer" }],
    _count: { players: 1100 }
  },
  {
    id: "t4",
    name: "National Juniors Championship",
    description: "U20 National Title. Qualifies for African Youths.",
    history: "The battle for the next generation of masters.",
    startDate: new Date("2025-08-15"),
    endDate: new Date("2025-08-18"),
    registrationDeadline: new Date("2025-08-05"),
    registrationFee: 20000,
    prizeFund: 3000000,
    venue: "Makerere University",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: false,
    _count: { players: 80 }
  },
  {
    id: "t5",
    name: "Kantinti Memorial Open",
    description: "Grand Prix #1 (8x Olympian namesake).",
    history: "Named after the legendary Olympian Kantinti.",
    startDate: new Date("2025-02-10"),
    endDate: new Date("2025-02-12"),
    registrationDeadline: new Date("2025-02-05"),
    registrationFee: 30000,
    prizeFund: 2000000,
    venue: "Kyambogo University",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true,
    _count: { players: 90 }
  },
  {
    id: "t6",
    name: "Kireka Open Championship",
    description: "Grand Prix #4. Significant for GP + National Rating.",
    history: "Traditionally hosted by Kireka Chess Club.",
    startDate: new Date("2025-09-05"),
    endDate: new Date("2025-09-07"),
    registrationDeadline: new Date("2025-08-28"),
    registrationFee: 30000,
    prizeFund: 2000000,
    venue: "Sports View Hotel",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true,
    _count: { players: 100 }
  },
  {
    id: "t7",
    name: "Zabasajja Memorial Open",
    description: "Grand Prix #5 (First Ugandan FM namesake). Season finale.",
    history: "Honoring FM Zabasajja, Uganda's first FM.",
    startDate: new Date("2025-12-15"),
    endDate: new Date("2025-12-17"),
    registrationDeadline: new Date("2025-12-10"),
    registrationFee: 30000,
    prizeFund: 2000000,
    venue: "Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true,
    _count: { players: 110 }
  },
  {
    id: "t8",
    name: "African Youth Chess Championship 2026",
    description: "Continental Event (Uganda HOST). Qualifies for World Youths.",
    history: "Uganda hosts the continent's brightest young stars.",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-08-10"),
    registrationDeadline: new Date("2026-07-15"),
    registrationFee: 100000,
    prizeFund: 0,
    venue: "Speke Resort Munyonyo",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: false,
    _count: { players: 400 }
  },

  // --- SUPPLEMENTARY RAPID & BLITZ EVENTS ---
  {
    id: "t9",
    name: "KTLCA Training Boost Oct 2025",
    description: "Training event for rapid skill enhancement.",
    startDate: new Date("2025-10-05"),
    endDate: new Date("2025-10-05"),
    format: "Rapid",
    totalRounds: 7,
    venue: "KTLCA Academy",
    isGrandPrix: false
  },
  {
    id: "t10",
    name: "Great Thinkers Independence Rapid",
    description: "Independence Day Major Junior (U10-U20).",
    startDate: new Date("2025-10-09"),
    endDate: new Date("2025-10-09"),
    format: "Rapid",
    totalRounds: 7,
    venue: "Kampala Parents",
    isGrandPrix: false
  },
  {
    id: "t11",
    name: "Bulemeezi Independence Rapid",
    description: "3rd Edition regional open.",
    startDate: new Date("2025-10-12"),
    endDate: new Date("2025-10-12"),
    format: "Rapid",
    totalRounds: 7,
    venue: "Bulemeezi",
    isGrandPrix: false
  },
  {
    id: "t12",
    name: "MUST Chess Open 3rd Edition",
    description: "University tournament at MUST.",
    startDate: new Date("2025-03-15"),
    endDate: new Date("2025-03-16"),
    format: "Rapid",
    totalRounds: 8,
    venue: "Mbarara University",
    isGrandPrix: false
  },
  {
    id: "t13",
    name: "Gulu University Open Rapid 2025",
    description: "Major Northern Uganda event.",
    startDate: new Date("2025-04-20"),
    endDate: new Date("2025-04-21"),
    format: "Rapid",
    totalRounds: 7,
    venue: "Gulu University",
    isGrandPrix: false
  },
  {
    id: "t14",
    name: "East Africa Junior Rapids 2025",
    description: "Regional youth championship.",
    startDate: new Date("2025-07-10"),
    endDate: new Date("2025-07-11"),
    format: "Rapid",
    totalRounds: 9,
    venue: "Kampala",
    isGrandPrix: false
  },
  {
    id: "t15",
    name: "Wampewo Blitz Challenge",
    description: "Popular club blitz challenge.",
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-06-01"),
    format: "Blitz",
    totalRounds: 11,
    venue: "Wampewo",
    isGrandPrix: false
  },
  {
    id: "t16",
    name: "Royal Knights Blitz Open 2025",
    description: "Club major blitz event.",
    startDate: new Date("2025-09-20"),
    endDate: new Date("2025-09-20"),
    format: "Blitz",
    totalRounds: 13,
    venue: "Royal Knights Club",
    isGrandPrix: false
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
