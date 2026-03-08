"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: {
  club?: string;
  region?: string;
  bio?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    // In our simulation, we'll "update" the user profile
    // This will hit our mock prisma.user.update
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        // Since our mock user is static, we're just simulating the call
        // In a real app, these would be fields on the User or Player model
        name: session.user.name, 
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile/edit");
    
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { success: false, error: "Failed to update profile." };
  }
}
