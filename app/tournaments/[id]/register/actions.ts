"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registerForTournamentAction(tournamentId: string, playerId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    // 1. Verify user is linked to this player
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, playerId: true }
    });

    if (!user || user.playerId !== playerId) {
      return { success: false, error: "Profile mismatch. You can only register yourself." };
    }

    // 2. Check tournament existence and deadline
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        players: {
          where: { id: playerId },
          select: { id: true }
        }
      }
    });

    if (!tournament) {
      return { success: false, error: "Tournament not found." };
    }

    if (tournament.registrationDeadline && new Date(tournament.registrationDeadline) < new Date()) {
      return { success: false, error: "Registration deadline has passed." };
    }

    // 3. Check if already registered
    if (tournament.players.length > 0) {
      return { success: false, error: "You are already registered for this tournament." };
    }

    // 4. Register
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        players: {
          connect: { id: playerId }
        }
      }
    });

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath(`/tournaments/${tournamentId}/register`);
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "Database error occurred." };
  }
}
