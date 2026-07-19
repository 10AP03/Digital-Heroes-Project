import { auth } from '@/app/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'RECRUITER') {
    return <RecruiterDashboard />
  }

  return <CandidateDashboard userId={session.user.id} />
}

async function RecruiterDashboard() {
  const [clientCount, roleCount, applicationCount, interviewCount, recentApplications] =
    await Promise.all([
      prisma.client.count(),
      prisma.role.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { role: true },
      }),
    ])

  const cards = [
    { label: 'Clients', count: clientCount, href: '/recruiter/clients' },
    { label: 'Applications', count: applicationCount, href: '/recruiter/applications' },
    { label: 'Interviews', count: interviewCount, href: '/recruiter/applications' },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="border rounded-lg p-4 hover:border-blue-400 transition"
          >
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-semibold mt-1">{c.count}</p>
          </a>
        ))}
      </div>

      <h2 className="text-lg font-medium mb-3">Recent Applications</h2>
      <div className="border rounded-lg divide-y">
        {recentApplications.length === 0 && (
          <p className="p-4 text-sm text-gray-400">No applications yet.</p>
        )}
        {recentApplications.map((app) => (
          <div key={app.id} className="p-4 flex justify-between items-center text-sm">
            <span>{app.role.title}</span>
            <span className="text-xs text-gray-500">{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

async function CandidateDashboard({ userId }: { userId: string }) {
  const applications = await prisma.application.findMany({
    where: { candidateId: userId },
    include: { role: true, interview: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Applications</h1>
        <a href="/candidate/roles" className="text-sm bg-black text-white rounded px-3 py-1.5">
          Browse Open Roles
        </a>
      </div>

      <div className="border rounded-lg divide-y">
        {applications.length === 0 && (
          <p className="p-4 text-sm text-gray-400">You haven&apos;t applied to anything yet.</p>
        )}
        {applications.map((app) => (
          <div key={app.id} className="p-4 flex justify-between items-center text-sm">
            <div>
              <p className="font-medium">{app.role.title}</p>
              <p className="text-xs text-gray-500">{app.status}</p>
            </div>
            {app.interview?.publicToken && app.interview.status !== 'COMPLETED' && (
              <a
                href={`/interview/${app.interview.publicToken}`}
                className="text-blue-600 text-xs font-medium"
              >
                Start Interview →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}