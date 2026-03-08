"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTournamentAction(data: {
  name: string;
  format: string;
  isGrandPrix: boolean;
  startDate: string;
  totalRounds: number;
  registrationDeadline: string;
  prizeFund: number;
  registrationFee: number;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated." };
  }

  // In real app, we would check for ADMIN role
  try {
    await prisma.tournament.create({
      data: {
        name: data.name,
        format: data.format,
        isGrandPrix: data.isGrandPrix,
        startDate: new Date(data.startDate),
        endDate: new Date(data.startDate), // Simplified for MVP
        totalRounds: data.totalRounds,
        registrationDeadline: new Date(data.registrationDeadline),
        prizeFund: data.prizeFund,
        registrationFee: data.registrationFee,
      }
    });

    revalidatePath("/admin");
    revalidatePath("/tournaments");
    
    return { success: true };
  } catch (error) {
    console.error("Tournament Creation Error:", error);
    return { success: false, error: "Database error occurred." };
  }
}
