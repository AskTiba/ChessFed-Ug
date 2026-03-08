"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function distributeGPPointsAction(tournamentId: string, rankings: { playerId: string, points: number }[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    // Simulation: Assign points for each player in the rankings
    for (const rank of rankings) {
      await prisma.grandPrixPoint.create({
        data: {
          points: rank.points,
          playerId: rank.playerId,
          tournamentId: tournamentId,
        }
      });
    }

    revalidatePath("/admin");
    revalidatePath("/grand-prix");
    revalidatePath("/national-team");
    
    return { success: true };
  } catch (error) {
    console.error("GP Distribution Error:", error);
    return { success: false, error: "Database error occurred during distribution." };
  }
}
