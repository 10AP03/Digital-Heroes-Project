"use server";

import { groq, GROQ_MODEL } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const QuestionSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string(),
        category: z.enum(["technical", "behavioral", "situational"]), // used for prompt structure only, not persisted
      })
    )
    .length(5),
});

export async function generateQuestionsForInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: {
        include: { role: true },
      },
    },
  });

  if (!interview) throw new Error("Interview not found");

  const role = interview.application.role;

  const prompt = `You are generating interview questions for a job role.

Role title: ${role.title}
Role description: ${role.description}

Generate exactly 5 interview questions: a mix of technical, behavioral, and situational questions relevant to this specific role. Do not be generic — tailor questions to the actual responsibilities implied by the title and description.

Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{"questions":[{"text":"...","category":"technical|behavioral|situational"}]}`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Groq returned empty response");

  let parsed;
  try {
    parsed = QuestionSchema.parse(JSON.parse(raw));
  } catch (err) {
    throw new Error(`Failed to parse Groq output: ${err instanceof Error ? err.message : "unknown"}`);
  }

  // wipe any prior questions for this interview (e.g. regeneration)
  await prisma.interviewQuestion.deleteMany({ where: { interviewId } });

  await prisma.interviewQuestion.createMany({
    data: parsed.questions.map((q, index) => ({
      interviewId,
      questionText: q.text,
      order: index + 1,
    })),
  });

  return parsed.questions;
}