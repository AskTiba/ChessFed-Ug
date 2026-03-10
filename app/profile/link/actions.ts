"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function linkPlayerAction(playerId: string, fideData?: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    // 1. Check if user already has a player
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, playerId: true }
    });

    if (user?.playerId) {
      return { success: false, error: "Your account is already linked to a player." };
    }

    let targetPlayerId = playerId;

    // 2. If it's a FIDE import (not yet in our DB)
    if (fideData) {
      // Check if player already exists in our DB by fideId
      const existingPlayer = await prisma.player.findUnique({
        where: { fideId: fideData.fideId.toString() }
      });

      if (existingPlayer) {
        targetPlayerId = existingPlayer.id;
      } else {
        // Create the player record
        const newPlayer = await prisma.player.create({
          data: {
            name: fideData.name,
            fideId: fideData.fideId.toString(),
            rating: fideData.rating || 1200,
            federation: "UGA"
          }
        });
        targetPlayerId = newPlayer.id;
      }
    }

    // 3. Check if player is already linked to someone else
    const player = await prisma.player.findUnique({
      where: { id: targetPlayerId },
      include: { user: true }
    });

    if (!player) {
      return { success: false, error: "Player record not found." };
    }

    if (player.user) {
      return { success: false, error: "This player profile is already linked to another account." };
    }

    // 4. Link them
    await prisma.user.update({
      where: { id: user!.id },
      data: { playerId: targetPlayerId }
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile/link");
    
    return { success: true };
  } catch (error) {
    console.error("Linking Error:", error);
    return { success: false, error: "Database error occurred." };
  }
}
