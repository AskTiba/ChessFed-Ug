import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClubManagementClient from "./ClubManagementClient";

export default async function ClubManagementPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const club = await prisma.club.findUnique({
    where: { id: params.id },
  });

  if (!club) return notFound();

  // In simulation, we assume the logged-in user is the owner/captain of this club
  const players = await prisma.player.findMany({
    where: { clubId: club.id },
    orderBy: { rating: 'desc' }
  });

  return <ClubManagementClient club={club} initialPlayers={players} />;
}
