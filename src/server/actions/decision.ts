"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@/generated/prisma/client";

export async function decideApplication(
  applicationId: string,
  decision: "HIRED" | "NOT_HIRED"
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Not authenticated");

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: decision as ApplicationStatus,
      decidedByUserId: userId,
    },
  });
}