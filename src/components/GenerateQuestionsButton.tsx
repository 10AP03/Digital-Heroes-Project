"use client";
import { useTransition } from "react";
import { generateQuestionsForInterview } from "@/server/actions/questions";

export function GenerateQuestionsButton({ interviewId }: { interviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await generateQuestionsForInterview(interviewId);
          } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to generate questions");
          }
        })
      }
      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {isPending ? "Generating…" : "Generate Interview Questions"}
    </button>
  );
}