import Link from 'next/link'
import { getApplicationsForRecruiter, shortlistApplication, rejectApplication } from '@/server/actions/applications'

export default async function ApplicationsPage() {
  const applications = await getApplicationsForRecruiter()

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-4">
      <a href="/dashboard" className="text-sm text-gray-500 hover:underline">← Dashboard</a>
      <h1 className="text-2xl font-semibold">Applications</h1>
      <ul className="space-y-3">
        {applications.map((a) => (
          <li key={a.id} className="border rounded-lg p-4 space-y-2">
            <p className="font-medium">{a.candidate.name} → {a.role.title}</p>
            <p className="text-sm text-gray-500">{a.role.client.name} · {a.status}</p>
            <a href={a.resumeUrl} target="_blank" className="text-sm underline">View resume</a>
            <div className="flex gap-2">
              <div className="flex gap-2">
     <form action={shortlistApplication.bind(null, a.id)}>
       <button className="bg-green-600 text-white rounded px-3 py-1 text-sm">Shortlist</button>
     </form>
     <form action={rejectApplication.bind(null, a.id)}>
       <button className="bg-red-600 text-white rounded px-3 py-1 text-sm">Reject</button>
     </form>
     {['SHORTLISTED', 'INTERVIEW_COMPLETED', 'HIRED', 'NOT_HIRED'].includes(a.status) && a.interview && (
  <Link
    href={`/interviews/${a.id}`}
    className="bg-blue-600 text-white rounded px-3 py-1 text-sm"
  >
    {a.interview.questions.length === 0
      ? 'Generate Questions'
      : a.interview.status === 'COMPLETED'
      ? 'View Interview'
      : 'Awaiting Candidate'}
  </Link>
)}
   </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}