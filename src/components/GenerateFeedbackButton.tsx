"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateFeedback } from "@/server/actions/feedback";

export function GenerateFeedbackButton({ interviewId }: { interviewId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await generateFeedback(interviewId);
            router.refresh(); // pull the freshly written feedback/scores into the server component
          } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to generate feedback");
          }
        })
      }
      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {isPending ? "Generating…" : "Generate Feedback"}
    </button>
  );
}