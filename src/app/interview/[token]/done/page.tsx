import { getInterviewByToken } from '@/server/actions/interview'
import { notFound, redirect } from 'next/navigation'

export default async function InterviewDonePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const interview = await getInterviewByToken(token)

  if (!interview) notFound()

  // Guard: if the interview isn't actually completed, send them back
  // to the live interview page instead of showing a false "done" state.
  if (interview.status !== 'COMPLETED') {
    redirect(`/interview/${token}`)
  }

  const answeredCount = interview.answers.length
  const totalCount = interview.questions.length

  return (
    <div className="max-w-xl mx-auto mt-24 px-4 text-center">
      <div className="text-4xl mb-4">✅</div>
      <h1 className="text-2xl font-semibold">Thanks — you're all done!</h1>
      <p className="text-gray-500 mt-3">
        Your responses have been submitted for the{' '}
        <span className="font-medium">{interview.application.role.title}</span> role.
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {answeredCount} of {totalCount} questions answered.
      </p>
      <p className="text-sm text-gray-400 mt-6">
        The recruiting team will review your interview and follow up with next steps.
        You can safely close this page now.
      </p>
    </div>
  )
}