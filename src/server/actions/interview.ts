'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function getInterviewByToken(token: string) {
  const interview = await prisma.interview.findUnique({
    where: { publicToken: token },
    include: {
      questions: { orderBy: { order: 'asc' } },
      answers: true,
      application: {
        include: { role: true },
      },
    },
  })
  return interview
}

const submitAnswerSchema = z.object({
  interviewId: z.string(),
  questionId: z.string(),
  answerText: z.string().min(1),
  inputMethod: z.enum(['voice', 'typed']),
})

export async function submitAnswer(input: z.infer<typeof submitAnswerSchema>) {
  const data = submitAnswerSchema.parse(input)

  // Mark as started the first time an answer comes in
  await prisma.interview.updateMany({
    where: { id: data.interviewId, status: 'SCHEDULED' },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  })

  await prisma.answer.upsert({
    where: {
      interviewId_questionId: {
        interviewId: data.interviewId,
        questionId: data.questionId,
      },
    },
    update: { answerText: data.answerText, inputMethod: data.inputMethod },
    create: data,
  })
}

export async function completeInterview(interviewId: string) {
  await prisma.interview.update({
    where: { id: interviewId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  })
}