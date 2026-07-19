import { getOpenRoles } from '@/server/actions/roles'

export default async function RolesPage() {
  const roles = await getOpenRoles()

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-4">
      <a href="/dashboard" className="text-sm text-gray-500 hover:underline">← Dashboard</a>
      <h1 className="text-2xl font-semibold">Open Roles</h1>
      <ul className="space-y-2">
        {roles.map((r) => (
          <li key={r.id} className="border rounded-lg p-4">
            <p className="font-medium">{r.title}</p>
            <p className="text-sm text-gray-500">{r.client.name}</p>
            <a href={`/candidate/apply/${r.id}`} className="text-sm underline">
              Apply
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}