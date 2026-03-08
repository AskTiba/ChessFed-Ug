import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clear existing data
  await prisma.grandPrixPoint.deleteMany();
  await prisma.score.deleteMany();
  await prisma.pairing.deleteMany();
  await prisma.game.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.official.deleteMany();
  await prisma.user.deleteMany();
  await prisma.player.deleteMany();

  console.log("Cleared existing data.");

  // 1. Create Sponsors
  const sponsors = [];
  const sponsorNames = ["MTN Uganda", "Stanbic Bank", "Centenary Bank", "KCCA", "National Council of Sports"];
  for (const name of sponsorNames) {
    const s = await prisma.sponsor.create({ data: { name } });
    sponsors.push(s);
  }

  // 2. Create Officials
  const officials = [];
  for (let i = 0; i < 5; i++) {
    const o = await prisma.official.create({
      data: {
        name: faker.person.fullName(),
        role: faker.helpers.arrayElement(["International Arbiter", "National Arbiter", "Tournament Organizer"]),
      },
    });
    officials.push(o);
  }

  // 3. Create Players
  const players = [];
  for (let i = 0; i < 100; i++) {
    const player = await prisma.player.create({
      data: {
        name: faker.person.fullName(),
        fideId: faker.number.int({ min: 1000000, max: 9999999 }).toString(),
        rating: faker.number.int({ min: 800, max: 2400 }),
        federation: "UGA",
      },
    });
    players.push(player);
  }
  console.log(`Created ${players.length} players.`);

  // 4. Create Tournaments (Annual Calendar)
  const tournamentNames = [
    { name: "Uganda National Championship", gp: true },
    { name: "K Rwabushenyi Memorial", gp: true },
    { name: "Zabasajja Memorial", gp: true },
    { name: "Uganda Open", gp: true },
    { name: "Easter Chess Championship", gp: false },
    { name: "Father Grimes Schools", gp: false },
    { name: "Inter-University Games", gp: false },
  ];

  for (const tInfo of tournamentNames) {
    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4);

    const deadline = new Date(startDate);
    deadline.setDate(startDate.getDate() - 7);

    // Pick random players, sponsors, officials
    const tPlayers = faker.helpers.arrayElements(players, 40);
    const tSponsors = faker.helpers.arrayElements(sponsors, 2);
    const tOfficials = faker.helpers.arrayElements(officials, 2);

    const tournament = await prisma.tournament.create({
      data: {
        name: tInfo.name,
        description: `The annual ${tInfo.name} is a cornerstone of Ugandan Chess, bringing together the best talent across the country.`,
        history: `First held in ${faker.number.int({ min: 1980, max: 2010 })}, this event has grown into one of the most prestigious on the calendar.`,
        startDate,
        endDate,
        registrationDeadline: deadline,
        registrationFee: faker.helpers.arrayElement([20000, 30000, 50000]),
        prizeFund: faker.helpers.arrayElement([1000000, 2000000, 5000000]),
        venue: `${faker.location.city()} Arena`,
        format: "Swiss",
        totalRounds: 8,
        isGrandPrix: tInfo.gp,
        players: { connect: tPlayers.map(p => ({ id: p.id })) },
        sponsors: { connect: tSponsors.map(s => ({ id: s.id })) },
        officials: { connect: tOfficials.map(o => ({ id: o.id })) },
      },
    });

    // If it's a Grand Prix and "finished" (mocking some points)
    if (tInfo.gp) {
      const topPlayers = faker.helpers.arrayElements(tPlayers, 5);
      const points = [10, 8, 6, 4, 2];
      for (let i = 0; i < topPlayers.length; i++) {
        await prisma.grandPrixPoint.create({
          data: {
            points: points[i],
            playerId: topPlayers[i].id,
            tournamentId: tournament.id,
          },
        });
      }
    }
    console.log(`Created tournament: ${tournament.name} (GP: ${tInfo.gp})`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
