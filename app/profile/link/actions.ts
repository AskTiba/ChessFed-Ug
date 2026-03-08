"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function linkPlayerAction(playerId: string) {
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

    // 2. Check if player is already linked to someone else
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { user: true }
    });

    if (!player) {
      return { success: false, error: "Player record not found." };
    }

    if (player.user) {
      return { success: false, error: "This player profile is already linked to another account." };
    }

    // 3. Link them
    await prisma.user.update({
      where: { id: user!.id },
      data: { playerId }
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile/link");
    
    return { success: true };
  } catch (error) {
    console.error("Linking Error:", error);
    return { success: false, error: "Database error occurred." };
  }
}
