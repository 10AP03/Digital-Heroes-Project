"use server";

import { groq, GROQ_MODEL } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FeedbackSchema = z.object({
  questions: z
    .array(
      z.object({
        order: z.number(),
        score: z.number().min(1).max(10),
        notes: z.string(),
      })
    )
    .min(1),
  overallFeedback: z.string(),
  overallRecommendation: z.string(), // finalized once ApplicationStatus enum is confirmed
});

export async function generateFeedback(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: { include: { role: true } },
      questions: { orderBy: { order: "asc" }, include: { answers: true } },
    },
  });

  if (!interview) throw new Error("Interview not found");
  if (interview.questions.length === 0) throw new Error("No questions found for this interview");

  const unanswered = interview.questions.filter((q) => q.answers.length === 0);
  if (unanswered.length > 0) {
    throw new Error(`Cannot generate feedback: ${unanswered.length} question(s) have no answer`);
  }

  const role = interview.application.role;

  const qaBlock = interview.questions
    .map((q) => {
      const answer = q.answers[0]; // @@unique([interviewId, questionId]) guarantees at most one
      return `Q${q.order} (${q.questionText}):\nA: ${answer.answerText}`;
    })
    .join("\n\n");

  const prompt = `You are evaluating a candidate's interview answers for a job role.

Role title: ${role.title}
Role description: ${role.description}

Here are the interview questions and the candidate's answers:

${qaBlock}

For each question, give a score from 1-10 and brief notes on the answer quality. Then give an overall feedback summary (2-4 sentences) and an overall recommendation.

Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{"questions":[{"order":1,"score":7,"notes":"..."}],"overallFeedback":"...","overallRecommendation":"..."}`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Groq returned empty response");

  let parsed;
  try {
    parsed = FeedbackSchema.parse(JSON.parse(raw));
  } catch (err) {
    throw new Error(`Failed to parse Groq output: ${err instanceof Error ? err.message : "unknown"}`);
  }

  await prisma.$transaction([
    ...parsed.questions.map((q) =>
      prisma.interviewQuestion.updateMany({
        where: { interviewId, order: q.order },
        data: { aiScore: q.score, aiNotes: q.notes },
      })
    ),
    prisma.interview.update({
      where: { id: interviewId },
      data: {
        overallFeedback: parsed.overallFeedback,
        overallRecommendation: parsed.overallRecommendation,
      },
    }),
  ]);

  return parsed;
}