"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideApplication } from "@/server/actions/decision";

export function DecisionButtons({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function decide(decision: "HIRED" | "NOT_HIRED") {
    startTransition(async () => {
      try {
        await decideApplication(applicationId, decision);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to record decision");
      }
    });
  }

  return (
    <div className="mt-3 flex gap-2">
      <button
        disabled={isPending}
        onClick={() => decide("HIRED")}
        className="rounded-md bg-green-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={isPending}
        onClick={() => decide("NOT_HIRED")}
        className="rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}