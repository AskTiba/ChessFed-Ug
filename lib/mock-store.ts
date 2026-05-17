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

// --- 57+ UGANDAN CLUBS ---
export const MOCK_CLUBS = [
  { id: "c1", name: "Kireka A", owner: "Kireka Sports Org", captain: "FM Harold Wanyama", founded: 1995, description: "The premier team of Kireka Chess Club.", logo: null },
  { id: "c2", name: "CNA Chess Club", owner: "CNA Sports", captain: "Captain CNA", founded: 2010, description: "A top-tier competitive club.", logo: null },
  { id: "c3", name: "Kireka Panthers", owner: "Kireka Sports Org", captain: "Captain Panthers", founded: 2012, description: "The second powerhouse team of Kireka.", logo: null },
  { id: "c4", name: "Kireka Salty", owner: "Kireka Sports Org", captain: "Captain Salty", founded: 2015, description: "Kireka's developmental competitive team.", logo: null },
  { id: "c5", name: "Mulago Kings Chess Club", owner: "Mulago Hospital", captain: "Captain Kings", founded: 1990, description: "One of Uganda's oldest and most respected clubs.", logo: null },
  { id: "c6", name: "Western Express Chess Club", owner: "Western Region", captain: "Captain Western", founded: 2018, description: "Representing the strength of Western Uganda.", logo: null },
  { id: "c7", name: "Gambit Chess Club", owner: "Gambit Sports", captain: "Captain Gambit", founded: 2014, description: "A club known for its aggressive and creative play.", logo: null },
  { id: "c8", name: "True Knights (Vision)", owner: "True Knights Org", captain: "Captain Vision", founded: 2016, description: "Part of the True Knights chess family.", logo: null },
  { id: "c9", name: "SOMChess Katwe", owner: "Robert Katende", captain: "WFM Shakira Ampaire", founded: 2012, description: "The famous academy from the heart of Katwe.", logo: null },
  { id: "c10", name: "Lighthouse Atoma", owner: "Lighthouse Chess", captain: "Captain Atoma", founded: 2017, description: "A competitive branch of Lighthouse Chess Club.", logo: null },
  { id: "c11", name: "MUK Team A", owner: "Makerere University", captain: "Captain MUK A", founded: 1970, description: "The flagship team of Makerere University.", logo: null },
  { id: "c12", name: "Olemwa Sports Club", owner: "Olemwa Org", captain: "Captain Olemwa", founded: 2019, description: "A rising force in the national league.", logo: null },
  { id: "c13", name: "MUK Echelons", owner: "Makerere University", captain: "Captain Echelons", founded: 2015, description: "Makerere's second competitive team.", logo: null },
  { id: "c14", name: "Jinja Knights Chess Club", owner: "Jinja District", captain: "Captain Jinja", founded: 2008, description: "Representing the source of the Nile.", logo: null },
  { id: "c15", name: "Uganda Civil Aviation Authority", owner: "UCAA", captain: "Captain UCAA", founded: 2005, description: "The official corporate team of the UCAA.", logo: null },
  { id: "c16", name: "Bulemeezi Diatoms Chess Club", owner: "Bulemeezi District", captain: "Captain Diatoms", founded: 2020, description: "A strong regional team from Bulemeezi.", logo: null },
  { id: "c17", name: "KIU ANCHORS", owner: "Kampala Intl University", captain: "Captain KIU", founded: 2011, description: "The competitive team of KIU.", logo: null },
  { id: "c18", name: "Lighthouse Meraki", owner: "Lighthouse Chess", captain: "Captain Meraki", founded: 2018, description: "Lighthouse's 'Meraki' competitive squad.", logo: null },
  { id: "c19", name: "Makindye Chess Club", owner: "Makindye Community", captain: "Captain Makindye", founded: 2000, description: "A long-standing community club in Kampala.", logo: null },
  { id: "c20", name: "SOMChess Kawempe", owner: "SOM Academy", captain: "Captain Kawempe", founded: 2015, description: "The Kawempe branch of SOM Chess Academy.", logo: null },
  { id: "c21", name: "MUBS Chess Club", owner: "MUBS", captain: "Captain MUBS", founded: 2009, description: "Makerere University Business School team.", logo: null },
  { id: "c22", name: "Watchers Team A", owner: "Watchers Chess", captain: "Captain Watchers A", founded: 2016, description: "The elite squad of Watchers Chess Club.", logo: null },
  { id: "c23", name: "Strategic Minds Chess Club", owner: "Strategic Minds Org", captain: "Captain Strategic", founded: 2019, description: "Focusing on tactical excellence.", logo: null },
  { id: "c24", name: "Crestals Chess Club", owner: "Crestals Org", captain: "Captain Crestals", founded: 2014, description: "A competitive club with a focus on youth.", logo: null },
  { id: "c25", name: "Mengo Chess Club", owner: "Mengo Community", captain: "Captain Mengo", founded: 1998, description: "One of the historic clubs in the Mengo area.", logo: null },
  { id: "c26", name: "Mulago Rooks", owner: "Mulago Hospital", captain: "Captain Rooks", founded: 2010, description: "The 'Rooks' squad from Mulago.", logo: null },
  { id: "c27", name: "Avengers Chess Club", owner: "Avengers Sports", captain: "Captain Avengers", founded: 2017, description: "A dynamic and competitive new club.", logo: null },
  { id: "c28", name: "Kampala University Chess Club", owner: "KU", captain: "Captain KU", founded: 2013, description: "Representing Kampala University.", logo: null },
  { id: "c29", name: "SOMChess Kiwawu", owner: "SOM Academy", captain: "Captain Kiwawu", founded: 2018, description: "The Kiwawu branch of SOM Chess Academy.", logo: null },
  { id: "c30", name: "Mulago Knights", owner: "Mulago Hospital", captain: "Captain Knights", founded: 2012, description: "The 'Knights' squad from Mulago.", logo: null },
  { id: "c31", name: "KTLCA Pawns", owner: "KTLCA Academy", captain: "Captain Pawns", founded: 2021, description: "Developmental team from KTLCA Academy.", logo: null },
  { id: "c32", name: "CHESSNMUSICDOTCOM", owner: "ChessNMusic", captain: "Captain CnM", founded: 2020, description: "Merging the art of chess and music.", logo: null },
  { id: "c33", name: "KTLCA Team B", owner: "KTLCA Academy", captain: "Captain KTLCA B", founded: 2021, description: "KTLCA Academy's second competitive team.", logo: null },
  { id: "c34", name: "West Nile Chess Club", owner: "West Nile Region", captain: "Captain West Nile", founded: 2019, description: "Representing the West Nile region.", logo: null },
  { id: "c35", name: "Cruciform Life Chess Club", owner: "Cruciform Org", captain: "Captain Cruciform", founded: 2018, description: "Chess with a mission.", logo: null },
  { id: "c36", name: "KTLCA Team A", owner: "KTLCA Academy", captain: "Captain KTLCA A", founded: 2021, description: "The flagship team of KTLCA Academy.", logo: null },
  { id: "c37", name: "Watoto Chess Club", owner: "Watoto Church", captain: "Captain Watoto", founded: 2015, description: "Empowering youth through chess.", logo: null },
  { id: "c38", name: "Mango Tech Chess Club", owner: "Mango Tech", captain: "Captain Mango", founded: 2022, description: "A tech-sponsored competitive club.", logo: null },
  { id: "c39", name: "Crystal Chess Club", owner: "Crystal Sports", captain: "Captain Crystal", founded: 2019, description: "A club focused on clarity and precision.", logo: null },
  { id: "c40", name: "Freedom Chess Club", owner: "Freedom Org", captain: "Captain Freedom", founded: 2017, description: "Promoting chess for all.", logo: null },
  { id: "c41", name: "True Knights (Wisdom)", owner: "True Knights Org", captain: "Captain Wisdom", founded: 2016, description: "The 'Wisdom' branch of True Knights.", logo: null },
  { id: "c42", name: "SOMChess Differently Abled", owner: "SOM Academy", captain: "Captain Specialized", founded: 2019, description: "Dedicated to chess for people with disabilities.", logo: null },
  { id: "c43", name: "Royal Knights Chess Team", owner: "Royal Knights Club", captain: "Captain Royal", founded: 2010, description: "A major club based in Kampala.", logo: null },
  { id: "c44", name: "Watchers Team B", owner: "Watchers Chess", captain: "Captain Watchers B", founded: 2016, description: "Watchers' second competitive squad.", logo: null },
  { id: "c45", name: "Green Hill Knights", owner: "Green Hill School", captain: "Captain Green Hill", founded: 2014, description: "Representing Green Hill Academy.", logo: null },
  { id: "c46", name: "Titans Chess Club", owner: "Titans Org", captain: "Captain Titans", founded: 2018, description: "A competitive and ambitious team.", logo: null },
  { id: "c47", name: "Great Thinkers Elites", owner: "Great Thinkers Academy", captain: "Captain GT Elites", founded: 2019, description: "The elite squad from GT Academy.", logo: null },
  { id: "c48", name: "Great Thinkers Queens Chess Club", owner: "Great Thinkers Academy", captain: "Captain GT Queens", founded: 2020, description: "A specialized team for female players.", logo: null },
  { id: "c49", name: "CYPROZ Chess Club Kyabakadde Boys", owner: "CYPROZ", captain: "Captain CYPROZ Boys", founded: 2021, description: "Kyabakadde branch boys team.", logo: null },
  { id: "c50", name: "Royal Life International Christian School Che", owner: "Royal Life School", captain: "Captain Royal Life", founded: 2022, description: "School team based in Kampala.", logo: null },
  { id: "c51", name: "Gombe Team A", owner: "Gombe District", captain: "Captain Gombe A", founded: 2018, description: "The primary team of Gombe.", logo: null },
  { id: "c52", name: "Gombe Team B", owner: "Gombe District", captain: "Captain Gombe B", founded: 2018, description: "Gombe's second competitive squad.", logo: null },
  { id: "c53", name: "CYPROZ Chess Club Kyabakadde Girls", owner: "CYPROZ", captain: "Captain CYPROZ Girls", founded: 2021, description: "Kyabakadde branch girls team.", logo: null },
  { id: "c54", name: "Kampala Junior Academy Pawns", owner: "KJA", captain: "Captain KJA Pawns", founded: 2015, description: "Youth team from Kampala Junior Academy.", logo: null },
  { id: "c55", name: "Butikiro Chess Club", owner: "Butikiro Community", captain: "Captain Butikiro", founded: 2012, description: "A community-based club.", logo: null },
  { id: "c56", name: "Wampeewo Queens", owner: "Wampeewo Community", captain: "Captain Wampeewo Q", founded: 2019, description: "All-female team from Wampeewo.", logo: null },
  { id: "c57", name: "Wampeewo Kings", owner: "Wampeewo Community", captain: "Captain Wampeewo K", founded: 2019, description: "The primary team of Wampeewo.", logo: null }
];

// --- NATIONAL LEAGUE STANDINGS ---
export const MOCK_LEAGUE_STANDINGS = [
  { rank: 1, clubId: "c1", name: "Kireka A", played: 12, won: 11, drawn: 0, lost: 1, matchPoints: 33, gamePoints: 54.0, tb1: 518, tb2: 338, tb3: 0 },
  { rank: 2, clubId: "c2", name: "CNA Chess Club", played: 12, won: 10, drawn: 1, lost: 1, matchPoints: 31, gamePoints: 53.0, tb1: 513, tb2: 313, tb3: 0 },
  { rank: 3, clubId: "c3", name: "Kireka Panthers", played: 12, won: 8, drawn: 2, lost: 2, matchPoints: 26, gamePoints: 48.5, tb1: 500, tb2: 257, tb3: 0 },
  { rank: 4, clubId: "c4", name: "Kireka Salty", played: 12, won: 8, drawn: 1, lost: 3, matchPoints: 25, gamePoints: 44.0, tb1: 536.5, tb2: 245, tb3: 0 },
  { rank: 5, clubId: "c5", name: "Mulago Kings Chess Club", played: 12, won: 7, drawn: 3, lost: 2, matchPoints: 24, gamePoints: 48.0, tb1: 504.5, tb2: 235, tb3: 0 },
  { rank: 6, clubId: "c6", name: "Western Express Chess Club", played: 12, won: 8, drawn: 0, lost: 4, matchPoints: 24, gamePoints: 43.0, tb1: 524.5, tb2: 222, tb3: 0 },
  { rank: 7, clubId: "c7", name: "Gambit Chess Club", played: 12, won: 7, drawn: 2, lost: 3, matchPoints: 23, gamePoints: 45.5, tb1: 515, tb2: 217, tb3: 0 },
  { rank: 8, clubId: "c8", name: "True Knights (Vision)", played: 12, won: 7, drawn: 1, lost: 4, matchPoints: 22, gamePoints: 44.5, tb1: 447, tb2: 182, tb3: 0 },
  { rank: 9, clubId: "c9", name: "SOMChess Katwe", played: 12, won: 7, drawn: 1, lost: 4, matchPoints: 22, gamePoints: 43.5, tb1: 440, tb2: 180, tb3: 0 },
  { rank: 10, clubId: "c10", name: "Lighthouse Atoma", played: 12, won: 7, drawn: 1, lost: 4, matchPoints: 22, gamePoints: 43.0, tb1: 496.5, tb2: 207, tb3: 0 },
  { rank: 11, clubId: "c11", name: "MUK Team A", played: 12, won: 7, drawn: 0, lost: 5, matchPoints: 21, gamePoints: 45.0, tb1: 497.5, tb2: 192, tb3: 0 },
  { rank: 12, clubId: "c12", name: "Olemwa Sports Club", played: 12, won: 7, drawn: 0, lost: 5, matchPoints: 21, gamePoints: 44.0, tb1: 433.5, tb2: 160, tb3: 0 },
  { rank: 13, clubId: "c13", name: "MUK Echelons", played: 12, won: 7, drawn: 0, lost: 5, matchPoints: 21, gamePoints: 41.0, tb1: 425.5, tb2: 152, tb3: 0 },
  { rank: 14, clubId: "c14", name: "Jinja Knights Chess Club", played: 12, won: 7, drawn: 0, lost: 5, matchPoints: 21, gamePoints: 39.5, tb1: 491.5, tb2: 166, tb3: 0 },
  { rank: 15, clubId: "c15", name: "Uganda Civil Aviation Authority", played: 12, won: 7, drawn: 0, lost: 5, matchPoints: 21, gamePoints: 37.5, tb1: 509, tb2: 182, tb3: 0 },
  { rank: 16, clubId: "c16", name: "Bulemeezi Diatoms Chess Club", played: 12, won: 7, drawn: 0, lost: 5, matchPoints: 21, gamePoints: 35.0, tb1: 465.5, tb2: 162, tb3: 0 },
  { rank: 17, clubId: "c17", name: "KIU ANCHORS", played: 12, won: 6, drawn: 2, lost: 4, matchPoints: 20, gamePoints: 39.5, tb1: 440, tb2: 169, tb3: 0 },
  { rank: 18, clubId: "c18", name: "Lighthouse Meraki", played: 12, won: 6, drawn: 2, lost: 4, matchPoints: 20, gamePoints: 39.5, tb1: 429, tb2: 149, tb3: 0 },
  { rank: 19, clubId: "c19", name: "Makindye Chess Club", played: 12, won: 6, drawn: 2, lost: 4, matchPoints: 20, gamePoints: 39.0, tb1: 466.5, tb2: 163, tb3: 0 },
  { rank: 20, clubId: "c20", name: "SOMChess Kawempe", played: 12, won: 6, drawn: 2, lost: 4, matchPoints: 20, gamePoints: 33.5, tb1: 440.5, tb2: 157, tb3: 0 },
  { rank: 21, clubId: "c21", name: "MUBS Chess Club", played: 12, won: 6, drawn: 1, lost: 5, matchPoints: 19, gamePoints: 39.5, tb1: 436, tb2: 139, tb3: 0 },
  { rank: 22, clubId: "c22", name: "Watchers Team A", played: 12, won: 6, drawn: 0, lost: 6, matchPoints: 18, gamePoints: 38.0, tb1: 407, tb2: 128, tb3: 0 },
  { rank: 23, clubId: "c23", name: "Strategic Minds Chess Club", played: 12, won: 6, drawn: 0, lost: 6, matchPoints: 18, gamePoints: 36.5, tb1: 424, tb2: 130, tb3: 0 },
  { rank: 24, clubId: "c24", name: "Crestals Chess Club", played: 12, won: 6, drawn: 0, lost: 6, matchPoints: 18, gamePoints: 36.0, tb1: 460, tb2: 144, tb3: 0 },
  { rank: 25, clubId: "c25", name: "Mengo Chess Club", played: 12, won: 6, drawn: 0, lost: 6, matchPoints: 18, gamePoints: 35.5, tb1: 440.5, tb2: 132, tb3: 0 },
  { rank: 26, clubId: "c26", name: "Mulago Rooks", played: 11, won: 5, drawn: 3, lost: 3, matchPoints: 18, gamePoints: 35.0, tb1: 401.5, tb2: 132, tb3: 0 },
  { rank: 27, clubId: "c27", name: "Avengers Chess Club", played: 11, won: 6, drawn: 0, lost: 5, matchPoints: 18, gamePoints: 35.0, tb1: 388, tb2: 112, tb3: 0 },
  { rank: 28, clubId: "c28", name: "Kampala University Chess Club", played: 11, won: 6, drawn: 0, lost: 5, matchPoints: 18, gamePoints: 31.0, tb1: 425.5, tb2: 140, tb3: 0 },
  { rank: 29, clubId: "c29", name: "SOMChess Kiwawu", played: 12, won: 6, drawn: 0, lost: 6, matchPoints: 18, gamePoints: 28.5, tb1: 422, tb2: 112, tb3: 0 },
  { rank: 30, clubId: "c30", name: "Mulago Knights", played: 12, won: 5, drawn: 2, lost: 5, matchPoints: 17, gamePoints: 34.5, tb1: 405.5, tb2: 129, tb3: 0 },
  { rank: 31, clubId: "c31", name: "KTLCA Pawns", played: 11, won: 4, drawn: 1, lost: 6, matchPoints: 16, gamePoints: 35.0, tb1: 404.5, tb2: 117, tb3: 0 },
  { rank: 32, clubId: "c32", name: "CHESSNMUSICDOTCOM", played: 9, won: 4, drawn: 1, lost: 4, matchPoints: 16, gamePoints: 34.0, tb1: 415.5, tb2: 125, tb3: 0 },
  { rank: 33, clubId: "c33", name: "KTLCA Team B", played: 12, won: 5, drawn: 1, lost: 6, matchPoints: 16, gamePoints: 34.0, tb1: 355.5, tb2: 89, tb3: 0 },
  { rank: 34, clubId: "c34", name: "West Nile Chess Club", played: 12, won: 5, drawn: 1, lost: 6, matchPoints: 16, gamePoints: 30.5, tb1: 396.5, tb2: 119, tb3: 0 },
  { rank: 35, clubId: "c35", name: "Cruciform Life Chess Club", played: 10, won: 4, drawn: 1, lost: 5, matchPoints: 16, gamePoints: 30.0, tb1: 420, tb2: 122, tb3: 0 },
  { rank: 36, clubId: "c36", name: "KTLCA Team A", played: 12, won: 5, drawn: 0, lost: 7, matchPoints: 15, gamePoints: 36.0, tb1: 385.5, tb2: 102, tb3: 0 },
  { rank: 37, clubId: "c37", name: "Watoto Chess Club", played: 11, won: 4, drawn: 3, lost: 4, matchPoints: 15, gamePoints: 35.0, tb1: 391.5, tb2: 112, tb3: 0 },
  { rank: 38, clubId: "c38", name: "Mango Tech Chess Club", played: 11, won: 4, drawn: 0, lost: 7, matchPoints: 15, gamePoints: 33.5, tb1: 422, tb2: 113, tb3: 0 },
  { rank: 39, clubId: "c39", name: "Crystal Chess Club", played: 10, won: 5, drawn: 0, lost: 5, matchPoints: 15, gamePoints: 33.5, tb1: 360.5, tb2: 88, tb3: 0 },
  { rank: 40, clubId: "c40", name: "Freedom Chess Club", played: 12, won: 5, drawn: 0, lost: 7, matchPoints: 15, gamePoints: 33.0, tb1: 420.5, tb2: 96, tb3: 0 },
  { rank: 41, clubId: "c41", name: "True Knights (Wisdom)", played: 12, won: 4, drawn: 2, lost: 6, matchPoints: 14, gamePoints: 36.0, tb1: 393, tb2: 89, tb3: 0 },
  { rank: 42, clubId: "c42", name: "SOMChess Differently Abled", played: 12, won: 4, drawn: 2, lost: 6, matchPoints: 14, gamePoints: 35.0, tb1: 387.5, tb2: 98, tb3: 0 },
  { rank: 43, clubId: "c43", name: "Royal Knights Chess Team", played: 11, won: 3, drawn: 2, lost: 6, matchPoints: 14, gamePoints: 33.0, tb1: 360, tb2: 90, tb3: 0 },
  { rank: 44, clubId: "c44", name: "Watchers Team B", played: 12, won: 4, drawn: 2, lost: 6, matchPoints: 14, gamePoints: 29.0, tb1: 349.5, tb2: 79, tb3: 0 },
  { rank: 45, clubId: "c45", name: "Green Hill Knights", played: 12, won: 4, drawn: 1, lost: 7, matchPoints: 13, gamePoints: 30.0, tb1: 383, tb2: 81, tb3: 0 },
  { rank: 46, clubId: "c46", name: "Titans Chess Club", played: 11, won: 3, drawn: 1, lost: 7, matchPoints: 13, gamePoints: 29.5, tb1: 407.5, tb2: 92, tb3: 0 },
  { rank: 47, clubId: "c47", name: "Great Thinkers Elites", played: 11, won: 3, drawn: 1, lost: 7, matchPoints: 13, gamePoints: 25.0, tb1: 394.5, tb2: 106, tb3: 0 },
  { rank: 48, clubId: "c48", name: "Great Thinkers Queens Chess Club", played: 11, won: 3, drawn: 1, lost: 7, matchPoints: 13, gamePoints: 23.5, tb1: 342.5, tb2: 79, tb3: 0 },
  { rank: 49, clubId: "c49", name: "CYPROZ Chess Club Kyabakadde Boys", played: 11, won: 3, drawn: 3, lost: 5, matchPoints: 12, gamePoints: 27.0, tb1: 374.5, tb2: 91, tb3: 0 },
  { rank: 50, clubId: "c50", name: "Royal Life International Christian School Che", played: 10, won: 3, drawn: 0, lost: 7, matchPoints: 12, gamePoints: 24.0, tb1: 320.5, tb2: 75, tb3: 0 },
  { rank: 51, clubId: "c51", name: "Gombe Team A", played: 12, won: 3, drawn: 1, lost: 8, matchPoints: 10, gamePoints: 29.0, tb1: 336, tb2: 51, tb3: 0 },
  { rank: 52, clubId: "c52", name: "Gombe Team B", played: 10, won: 2, drawn: 0, lost: 8, matchPoints: 9, gamePoints: 20.0, tb1: 331, tb2: 51, tb3: 0 },
  { rank: 53, clubId: "c53", name: "CYPROZ Chess Club Kyabakadde Girls", played: 10, won: 3, drawn: 0, lost: 7, matchPoints: 9, gamePoints: 19.5, tb1: 318, tb2: 42, tb3: 0 },
  { rank: 54, clubId: "c54", name: "Kampala Junior Academy Pawns", played: 11, won: 2, drawn: 0, lost: 9, matchPoints: 9, gamePoints: 14.0, tb1: 325.5, tb2: 47, tb3: 0 },
  { rank: 55, clubId: "c55", name: "Butikiro Chess Club", played: 10, won: 2, drawn: 2, lost: 6, matchPoints: 8, gamePoints: 21.5, tb1: 375.5, tb2: 65, tb3: 0 },
  { rank: 56, clubId: "c56", name: "Wampeewo Queens", played: 9, won: 2, drawn: 1, lost: 6, matchPoints: 7, gamePoints: 17.0, tb1: 337.5, tb2: 54, tb3: 0 },
  { rank: 57, clubId: "c57", name: "Wampeewo Kings", played: 8, won: 1, drawn: 1, lost: 6, matchPoints: 4, gamePoints: 14.5, tb1: 305.5, tb2: 26, tb3: 0 }
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
  // ==========================================
  // 1. UGANDA NATIONAL JUNIORS CHESS CHAMPIONSHIPS
  // ==========================================
  {
    id: "t_juniors_2026",
    name: "Uganda National Juniors Chess Championships 2026",
    description: "The premier Under-20 national championship. Top finishers qualify for the African Youth Chess Championship.",
    history: "An annual youth showcase representing the absolute future of Ugandan chess excellence, drawing talent from all four regions of the country.",
    startDate: new Date("2026-04-10"),
    endDate: new Date("2026-04-13"),
    registrationDeadline: new Date("2026-04-05"),
    registrationFee: 25000,
    prizeFund: 4000000,
    venue: "Nob View Hotel, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: false
  },
  {
    id: "t_juniors_2025",
    name: "Uganda National Juniors Chess Championships 2025",
    description: "Under-20 national championship (2025 Edition). Won by FM Harold Wanyama's junior prodigies.",
    history: "A historic edition where the youth of Uganda fought fiercely at Makerere University.",
    startDate: new Date("2025-04-12"),
    endDate: new Date("2025-04-15"),
    registrationDeadline: new Date("2025-04-05"),
    registrationFee: 20000,
    prizeFund: 3000000,
    venue: "Makerere University Main Hall, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: false
  },
  {
    id: "t_juniors_2024",
    name: "Uganda National Juniors Chess Championships 2024",
    description: "Under-20 national championship (2024 Edition). Completed with record turnout of school players.",
    history: "Held at Makerere University, this event established several new national candidate masters.",
    startDate: new Date("2024-04-15"),
    endDate: new Date("2024-04-18"),
    registrationDeadline: new Date("2024-04-10"),
    registrationFee: 15000,
    prizeFund: 2000000,
    venue: "Makerere University Main Hall, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: false
  },

  // ==========================================
  // 2. SUPER 12 NATIONAL CHAMPIONSHIP
  // ==========================================
  {
    id: "t_super12_2026",
    name: "Super 12 National Chess Championship 2026",
    description: "The ultimate round-robin tournament for Uganda's top 12 players. The official qualifier for the Chess Olympiad 2026 in Samarkand.",
    history: "The crown jewel of the Uganda Chess Federation calendar. Only the top 12 rated players in the country receive an invite to this grueling battle.",
    startDate: new Date("2026-06-15"),
    endDate: new Date("2026-06-20"),
    registrationDeadline: new Date("2026-06-01"),
    registrationFee: 50000,
    prizeFund: 15000000,
    venue: "MTN Arena, Lugogo, Kampala",
    format: "Round Robin",
    totalRounds: 11,
    isGrandPrix: true
  },
  {
    id: "t_super12_2025",
    name: "Super 12 National Chess Championship 2025",
    description: "The 2025 edition of the top-12 national championship. Won by IM Arthur Ssegwanyi in a thrilling final round.",
    history: "An intense round-robin battle hosted at MTN Arena Lugogo that determined the team representing Uganda in international opens.",
    startDate: new Date("2025-06-10"),
    endDate: new Date("2025-06-15"),
    registrationDeadline: new Date("2025-06-01"),
    registrationFee: 50000,
    prizeFund: 12000000,
    venue: "MTN Arena, Lugogo, Kampala",
    format: "Round Robin",
    totalRounds: 11,
    isGrandPrix: true
  },

  // ==========================================
  // 3. WOMEN'S CHESS RAPID
  // ==========================================
  {
    id: "t_women_rapid_2026",
    name: "Women's Chess Rapid 2026",
    description: "Special rapid tournament dedicated exclusively to celebrating and promoting female players across East Africa.",
    history: "Organized annually in honor of International Women's Day to foster female master-level play in Uganda.",
    startDate: new Date("2026-03-08"),
    endDate: new Date("2026-03-08"),
    registrationDeadline: new Date("2026-03-05"),
    registrationFee: 15000,
    prizeFund: 2500000,
    venue: "Sheraton Hotel, Kampala",
    format: "Rapid",
    totalRounds: 7,
    isGrandPrix: false
  },
  {
    id: "t_women_rapid_2025",
    name: "Women's Chess Rapid 2025",
    description: "2025 Edition of the prestigious International Women's Day rapid tournament. Crowned by WFM Shakira Ampaire.",
    history: "Hosted at the Sheraton Hotel with massive corporate backing to empower local female players.",
    startDate: new Date("2025-03-08"),
    endDate: new Date("2025-03-08"),
    registrationDeadline: new Date("2025-03-05"),
    registrationFee: 10000,
    prizeFund: 2000000,
    venue: "Sheraton Hotel, Kampala",
    format: "Rapid",
    totalRounds: 7,
    isGrandPrix: false
  },

  // ==========================================
  // 4. CENTRAL UGANDA OPEN CHESS CHAMPIONSHIP-GP
  // ==========================================
  {
    id: "t_central_open_2026",
    name: "Central Uganda Open Chess Championship 2026",
    description: "Grand Prix Event #1. The opening major tournament of the 2026 season for central region chess clubs.",
    history: "Traditionally attracts the highest density of FIDE-rated masters in Kampala. A critical test of early season form.",
    startDate: new Date("2026-02-20"),
    endDate: new Date("2026-02-22"),
    registrationDeadline: new Date("2026-02-15"),
    registrationFee: 30000,
    prizeFund: 5000000,
    venue: "Sheraton Hotel, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },
  {
    id: "t_central_open_2025",
    name: "Central Uganda Open Chess Championship 2025",
    description: "Grand Prix Event #1 (2025 Edition). Set the stage for a tight Grand Prix race.",
    history: "Hosted at Sheraton Hotel, featuring several international arbiters and regional masters.",
    startDate: new Date("2025-02-22"),
    endDate: new Date("2025-02-24"),
    registrationDeadline: new Date("2025-02-15"),
    registrationFee: 30000,
    prizeFund: 4000000,
    venue: "Sheraton Hotel, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },

  // ==========================================
  // 5. WESTERN UGANDA OPEN CHESS CHAMPIONSHIP-GP
  // ==========================================
  {
    id: "t_western_open_2026",
    name: "Western Uganda Open Chess Championship 2026",
    description: "Grand Prix Event #2. The regional showcase representing the rapid growth of chess in Western Uganda.",
    history: "Organized to expand competitive FIDE rated tournaments beyond the capital city of Kampala.",
    startDate: new Date("2026-03-25"),
    endDate: new Date("2026-03-27"),
    registrationDeadline: new Date("2026-03-20"),
    registrationFee: 30000,
    prizeFund: 4000000,
    venue: "Pelikan Hotel, Mbarara",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },
  {
    id: "t_western_open_2025",
    name: "Western Uganda Open Chess Championship 2025",
    description: "Grand Prix Event #2 (2025 Edition). Broke attendance records for regional events.",
    history: "Mbarara welcomed players from Rwanda and Western Uganda for a highly competitive weekend.",
    startDate: new Date("2025-03-20"),
    endDate: new Date("2025-03-22"),
    registrationDeadline: new Date("2025-03-15"),
    registrationFee: 25000,
    prizeFund: 3500000,
    venue: "Pelikan Hotel, Mbarara",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },

  // ==========================================
  // 6. FATHER GRIMES NATIONAL SCHOOLS CHESS CHAMPIONSHIP
  // ==========================================
  {
    id: "t_father_grimes_2026",
    name: "Father Grimes National Schools Chess Championship 2026",
    description: "The absolute largest school chess tournament in East Africa, gathering over 1,200 junior chess champions.",
    history: "Named in honor of Father Grimes, a legendary educator and patron who introduced organized schools chess to Uganda.",
    startDate: new Date("2026-05-10"),
    endDate: new Date("2026-05-15"),
    registrationDeadline: new Date("2026-05-01"),
    registrationFee: 15000,
    prizeFund: 0,
    venue: "St. Mary's College Kisubi, Entebbe",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: false
  },
  {
    id: "t_father_grimes_2025",
    name: "Father Grimes National Schools Chess Championship 2025",
    description: "2025 School Championship. Gayaza High School hosted a stunning 5-day tournament.",
    history: "A premier youth sports event where students from across Uganda represented their school banners.",
    startDate: new Date("2025-05-12"),
    endDate: new Date("2025-05-17"),
    registrationDeadline: new Date("2025-05-05"),
    registrationFee: 12000,
    prizeFund: 0,
    venue: "Gayaza High School, Gayaza",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: false
  },

  // ==========================================
  // 7. AFRICA YOUTH CHESS CHAMPIONSHIP
  // ==========================================
  {
    id: "t_africa_youth_2026",
    name: "Africa Youth Chess Championship 2026",
    description: "Continental Event hosted by Uganda. FIDE Direct titles (WIM, WFM, CM, FM) and World Youth Championship qualification at stake.",
    history: "The Uganda Chess Federation welcomes young champions from all 54 African countries to Speke Resort Munyonyo.",
    startDate: new Date("2026-08-15"),
    endDate: new Date("2026-08-23"),
    registrationDeadline: new Date("2026-07-15"),
    registrationFee: 100000,
    prizeFund: 0,
    venue: "Speke Resort Munyonyo, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: false
  },

  // ==========================================
  // 8. NORTHERN UGANDA OPEN CHESS CHAMPIONSHIP-GP
  // ==========================================
  {
    id: "t_northern_open_2026",
    name: "Northern Uganda Open Chess Championship 2026",
    description: "Grand Prix Event #3. Driving competitive master-level chess to the Gulu sports hub.",
    history: "Part of the federation's aggressive decentralization initiative to foster northern talent.",
    startDate: new Date("2026-07-10"),
    endDate: new Date("2026-07-12"),
    registrationDeadline: new Date("2026-07-05"),
    registrationFee: 30000,
    prizeFund: 4000000,
    venue: "Gulu University Hall, Gulu",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },

  // ==========================================
  // 9. EASTERN UGANDA OPEN CHESS CHAMPIONSHIP-GP
  // ==========================================
  {
    id: "t_eastern_open_2026",
    name: "Eastern Uganda Open Chess Championship 2026",
    description: "Grand Prix Event #4. Hosted in the historic city of Jinja, by the source of the Nile River.",
    history: "A popular tournament drawing chess masters from across Eastern Uganda and Western Kenya.",
    startDate: new Date("2026-09-04"),
    endDate: new Date("2026-09-06"),
    registrationDeadline: new Date("2026-08-28"),
    registrationFee: 30000,
    prizeFund: 4000000,
    venue: "Sunset Hotel, Jinja",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },

  // ==========================================
  // 10. AFRICA INDIVIDUAL CHESS CHAMPIONSHIP
  // ==========================================
  {
    id: "t_africa_individual_2026",
    name: "Africa Individual Chess Championship 2026",
    description: "The peak continental championship for senior master-level players. Serves as a World Cup qualifier.",
    history: "Hosting this event is a historic honor for the Uganda Chess Federation, cementing Kampala as an African chess capital.",
    startDate: new Date("2026-10-01"),
    endDate: new Date("2026-10-09"),
    registrationDeadline: new Date("2026-09-15"),
    registrationFee: 120000,
    prizeFund: 20000000,
    venue: "Mestil Hotel, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: false
  },

  // ==========================================
  // 11. AFRICAN SCHOOLS TEAMS CHAMPIONSHIP
  // ==========================================
  {
    id: "t_african_schools_teams_2026",
    name: "African Schools Teams Championship 2026",
    description: "Continental team tournament. Schools represent their respective countries in teams of 4.",
    history: "Promoting institutional team cohesion and continental academic exchanges through the medium of chess.",
    startDate: new Date("2026-11-20"),
    endDate: new Date("2026-11-25"),
    registrationDeadline: new Date("2026-11-10"),
    registrationFee: 80000,
    prizeFund: 0,
    venue: "Speke Resort Munyonyo, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: false
  },

  // ==========================================
  // 12. UGANDA OPEN CHESS CHAMPIONSHIP-GP
  // ==========================================
  {
    id: "t_uganda_open_2026",
    name: "Uganda Open Chess Championship 2026",
    description: "Grand Prix Event #5. The annual, international flagship open event. IM and GM norm opportunities.",
    history: "The historically largest and most prestigious open tournament in Uganda, welcoming international masters from across the globe.",
    startDate: new Date("2026-11-10"),
    endDate: new Date("2026-11-15"),
    registrationDeadline: new Date("2026-11-01"),
    registrationFee: 40000,
    prizeFund: 10000000,
    venue: "Hotel Africana, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true
  },
  {
    id: "t_uganda_open_2025",
    name: "Uganda Open Chess Championship 2025",
    description: "Grand Prix Event #5 (2025 Edition). Attracted over 150 players from 6 different nations.",
    history: "Crowned at Hotel Africana after a fierce 9-round battle under Chief Arbiter IA Stephen Kisuze.",
    startDate: new Date("2025-11-12"),
    endDate: new Date("2025-11-17"),
    registrationDeadline: new Date("2025-11-05"),
    registrationFee: 40000,
    prizeFund: 8000000,
    venue: "Hotel Africana, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true
  },

  // ==========================================
  // 13. RWABUSHENYI MEMORIAL OPEN CHESS TOURNAMENT-GP
  // ==========================================
  {
    id: "t_rwabushenyi_2026",
    name: "Rwabushenyi Memorial Open Chess Tournament 2026",
    description: "Grand Prix Event #6. Held in honor of the late Joaquin Rwabushenyi, a pioneer and former chairman of UCF.",
    history: "A mandatory fixture on the UCF calendar, sponsored by Civil Aviation Authority, representing extreme national pride.",
    startDate: new Date("2026-12-04"),
    endDate: new Date("2026-12-07"),
    registrationDeadline: new Date("2026-11-28"),
    registrationFee: 40000,
    prizeFund: 8000000,
    venue: "Hotel Africana, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true
  },
  {
    id: "t_rwabushenyi_2025",
    name: "Rwabushenyi Memorial Open Chess Tournament 2025",
    description: "Grand Prix Event #6 (2025 Edition). A thrilling tournament of 9 rounds representing the pinnacle of end-of-year forms.",
    history: "Held at Hotel Africana, sponsored by UCAA, drawing huge crowds and national press coverage.",
    startDate: new Date("2025-12-05"),
    endDate: new Date("2025-12-08"),
    registrationDeadline: new Date("2025-11-28"),
    registrationFee: 45000,
    prizeFund: 7000000,
    venue: "Hotel Africana, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true
  },

  // ==========================================
  // 14. KANTINTI MEMORIAL OPEN CHESS TOURNAMENT-GP
  // ==========================================
  {
    id: "t_kantinti_2026",
    name: "Kantinti Memorial Open Chess Tournament 2026",
    description: "Dedicated to the late George Kantinti, a beloved eight-time Olympian and chess master.",
    history: "A memorial event designed to promote technical precision and classical time controls among local youth and seniors.",
    startDate: new Date("2026-02-12"),
    endDate: new Date("2026-02-14"),
    registrationDeadline: new Date("2026-02-05"),
    registrationFee: 30000,
    prizeFund: 3000000,
    venue: "Kyambogo University, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },
  {
    id: "t_kantinti_2025",
    name: "Kantinti Memorial Open Chess Tournament 2025",
    description: "2025 Edition honoring George Kantinti. A historic Swiss that opened the competitive year.",
    history: "Hosted at Kyambogo University Main Hall, this event featured top-class tactical battles.",
    startDate: new Date("2025-02-10"),
    endDate: new Date("2025-02-12"),
    registrationDeadline: new Date("2025-02-05"),
    registrationFee: 30000,
    prizeFund: 2000000,
    venue: "Kyambogo University, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },

  // ==========================================
  // 15. KIREKA OPEN CHESS CHAMPIONSHIP-GP
  // ==========================================
  {
    id: "t_kireka_open_2026",
    name: "Kireka Open Chess Championship 2026",
    description: "Grand Prix Event #7. The annual post-Christmas chess festival hosted by Kireka Chess Club.",
    history: "Known as the most festive and aggressively fought open of the year. Traditional season closer.",
    startDate: new Date("2026-12-26"),
    endDate: new Date("2026-12-30"),
    registrationDeadline: new Date("2026-12-20"),
    registrationFee: 35000,
    prizeFund: 5000000,
    venue: "Sports View Hotel, Kireka, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true
  },
  {
    id: "t_kireka_open_2025",
    name: "Kireka Open Chess Championship 2025",
    description: "2025 Edition of the highly anticipated Kireka post-Christmas open.",
    history: "Attracted East Africa's top bullet and classical masters for a competitive holiday showdown.",
    startDate: new Date("2025-12-25"),
    endDate: new Date("2025-12-29"),
    registrationDeadline: new Date("2025-12-20"),
    registrationFee: 30000,
    prizeFund: 4000000,
    venue: "Sports View Hotel, Kireka, Kampala",
    format: "Swiss",
    totalRounds: 9,
    isGrandPrix: true
  },

  // ==========================================
  // 16. INDEPENDENCE DAY RAPID
  // ==========================================
  {
    id: "t_independence_rapid_2026",
    name: "Independence Day Rapid 2026",
    description: "A fast-paced rapid holiday tournament celebrating Uganda's national Independence Day.",
    history: "A single-day speed chess extravaganza drawing casual amateurs and grandmasters alike.",
    startDate: new Date("2026-10-09"),
    endDate: new Date("2026-10-09"),
    registrationDeadline: new Date("2026-10-05"),
    registrationFee: 15000,
    prizeFund: 2000000,
    venue: "Sheraton Hotel, Kampala",
    format: "Rapid",
    totalRounds: 7,
    isGrandPrix: false
  },
  {
    id: "t_independence_rapid_2025",
    name: "Independence Day Rapid 2025",
    description: "2025 Edition celebrating Uganda's 63rd Independence Day anniversary through the game of chess.",
    history: "Hosted at Kampala Parents School as a premium holiday rapid festival.",
    startDate: new Date("2025-10-09"),
    endDate: new Date("2025-10-09"),
    registrationDeadline: new Date("2025-10-05"),
    registrationFee: 10000,
    prizeFund: 1500000,
    venue: "Kampala Parents School, Kampala",
    format: "Rapid",
    totalRounds: 7,
    isGrandPrix: false
  },

  // ==========================================
  // 17. ZABASAJJA MEMORIAL OPEN CHESS TOURNAMENT-GP
  // ==========================================
  {
    id: "t_zabasajja_2026",
    name: "Zabasajja Memorial Open Chess Tournament 2026",
    description: "Honoring the legendary FM Willy Zabasajja, Uganda's first FIDE Master and a nine-time national champion.",
    history: "A highly prestigious memorial event focusing on aggressive tactical play, reflecting FM Zabasajja's legendary chess style.",
    startDate: new Date("2026-05-22"),
    endDate: new Date("2026-05-24"),
    registrationDeadline: new Date("2026-05-18"),
    registrationFee: 30000,
    prizeFund: 3000000,
    venue: "MTN Arena, Lugogo, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  },
  {
    id: "t_zabasajja_2025",
    name: "Zabasajja Memorial Open Chess Tournament 2025",
    description: "2025 Edition honoring FM Willy Zabasajja. Crowned by IM Arthur Ssegwanyi after 8 classical rounds.",
    history: "Hosted at Lugogo, it remains a beloved tournament defining mid-season standings for local clubs.",
    startDate: new Date("2025-05-24"),
    endDate: new Date("2025-05-26"),
    registrationDeadline: new Date("2025-05-18"),
    registrationFee: 25000,
    prizeFund: 2500000,
    venue: "MTN Arena, Lugogo, Kampala",
    format: "Swiss",
    totalRounds: 8,
    isGrandPrix: true
  }
];

export const MOCK_GP_POINTS = [
  { id: "gp1", playerId: "p1", points: 10, tournamentId: "t_super12_2026", tournament: { name: "Super 12 National Chess Championship 2026", startDate: new Date("2026-06-15") } },
  { id: "gp2", playerId: "p2", points: 8, tournamentId: "t_super12_2026", tournament: { name: "Super 12 National Chess Championship 2026", startDate: new Date("2026-06-15") } },
  { id: "gp3", playerId: "p1", points: 10, tournamentId: "t_rwabushenyi_2026", tournament: { name: "Rwabushenyi Memorial Open Chess Tournament 2026", startDate: new Date("2026-12-04") } },
  { id: "gp4", playerId: "p2", points: 10, tournamentId: "t_rwabushenyi_2026", tournament: { name: "Rwabushenyi Memorial Open Chess Tournament 2026", startDate: new Date("2026-12-04") } },
];

export const MOCK_PAIRINGS = [
  { table: 1, white: "FM Harold Wanyama", black: "IM Arthur Ssegwanyi", result: "1/2-1/2", round: 4 },
  { table: 2, white: "FM Patrick Kawuma", black: "Emanuel Egesa", result: "1-0", round: 4 },
];

export const MOCK_STANDINGS = [
  { rank: 1, name: "FM Harold Wanyama", rating: 2380, score: 3.5, buchholz: 12.5 },
  { rank: 2, name: "IM Arthur Ssegwanyi", rating: 2420, score: 3.5, buchholz: 11.0 },
];
