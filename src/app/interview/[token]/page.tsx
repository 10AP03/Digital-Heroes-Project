import { getInterviewByToken } from '@/server/actions/interview'
import { notFound } from 'next/navigation'
import VoiceInterviewClient from '@/components/VoiceInterviewClient'

export default async function PublicInterviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params;
  const interview = await getInterviewByToken(token)

  if (!interview) notFound()

  if (interview.status === 'COMPLETED') {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-semibold">Interview already submitted</h1>
        <p className="text-gray-500 mt-2">
          Thanks — your responses have already been recorded. You can close this page.
        </p>
      </div>
    )
  }

  if (interview.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-semibold">Interview not ready yet</h1>
        <p className="text-gray-500 mt-2">
          The recruiter hasn&apos;t generated questions for this interview yet. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <VoiceInterviewClient
      interviewId={interview.id}
      token={token}
      roleTitle={interview.application.role.title}
      questions={interview.questions.map((q) => ({
        id: q.id,
        order: q.order,
        questionText: q.questionText,
      }))}
      existingAnswers={interview.answers.map((a) => ({
        questionId: a.questionId,
        answerText: a.answerText,
      }))}
    />
  )
}