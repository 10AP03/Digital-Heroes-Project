import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { GenerateQuestionsButton } from "@/components/GenerateQuestionsButton";
import { GenerateFeedbackButton } from "@/components/GenerateFeedbackButton";
import { DecisionButtons } from "@/components/DecisionButtons";
import { notFound, redirect } from "next/navigation";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect("/login"); 
  }

  const interview = await prisma.interview.findUnique({
    where: { applicationId },
    include: {
      application: { include: { role: true } },
      questions: { orderBy: { order: "asc" }, include: { answers: true } },
    },
  });

  if (!interview) notFound();

  const allAnswered =
    interview.questions.length > 0 &&
    interview.questions.every((q) => q.answers.length > 0);

  const decisionMade =
    interview.application.status === "HIRED" ||
    interview.application.status === "NOT_HIRED";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <a href="/recruiter/applications" className="text-sm text-gray-500 hover:underline">← Applications</a>
      <h1 className="text-xl font-semibold">
        Interview — {interview.application.role.title}
      </h1>
      <p className="text-sm text-gray-500">Status: {interview.status}</p>

      {interview.questions.length === 0 ? (
  <div className="mt-6 border-2 border-dashed rounded-lg p-6 text-center">
    <p className="text-sm text-gray-500 mb-3">
      This candidate has been shortlisted. Generate interview questions to proceed.
    </p>
    <GenerateQuestionsButton interviewId={interview.id} />
  </div>
) : (
  <div className="mt-6">
    <GenerateQuestionsButton interviewId={interview.id} />
  </div>
)}

      {interview.questions.length > 0 && (
        <ol className="mt-6 space-y-3">
          {interview.questions.map((q) => (
            <li key={q.id} className="rounded border p-3">
              <p className="font-medium">
                {q.order}. {q.questionText}
              </p>
              {q.answers[0] && (
                <p className="mt-1 text-sm text-gray-700">
                  {q.answers[0].answerText}{" "}
                  <span className="text-xs text-gray-400">
                    ({q.answers[0].inputMethod})
                  </span>
                </p>
              )}
              {q.aiScore != null && (
                <p className="mt-1 text-xs text-gray-500">
                  AI score: {q.aiScore}/10 — {q.aiNotes}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}

      {allAnswered && (
        <div className="mt-6">
          <GenerateFeedbackButton interviewId={interview.id} />
        </div>
      )}

      {interview.overallFeedback && (
        <div className="mt-6 rounded border p-4">
          <h2 className="font-medium">Overall Feedback</h2>
          <p className="mt-1 text-sm text-gray-700">
            {interview.overallFeedback}
          </p>
          <p className="mt-2 text-sm font-medium">
            Recommendation: {interview.overallRecommendation}
          </p>

          {decisionMade ? (
            <p className="mt-3 text-sm font-semibold">
              Final decision: {interview.application.status}
            </p>
          ) : (
            <DecisionButtons applicationId={interview.applicationId} />
          )}
        </div>
      )}
    </div>
  );
}