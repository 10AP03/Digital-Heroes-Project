import { getClient } from '@/server/actions/clients'
import { createRole } from '@/server/actions/roles'
import { notFound } from 'next/navigation'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const client = await getClient(clientId)
  if (!client) notFound()

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <a href="/recruiter/clients" className="text-sm text-gray-500 hover:underline">← Clients</a>
      <h1 className="text-2xl font-semibold">{client.name}</h1>

      <form action={createRole} className="space-y-3 border rounded-lg p-4">
        <input type="hidden" name="clientId" value={clientId} />
        <input name="title" placeholder="Role title" required
          className="w-full border rounded px-3 py-2" />
        <textarea name="description" placeholder="Role description" required
          className="w-full border rounded px-3 py-2" />
        <input name="questionCount" type="number" defaultValue={5} min={1} max={15}
          className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-black text-white rounded px-4 py-2">
          Add Role
        </button>
      </form>

      <ul className="space-y-2">
        {client.roles.map((r) => (
          <li key={r.id} className="border rounded-lg p-4">
            <p className="font-medium">{r.title}</p>
            <p className="text-sm text-gray-500">{r.isOpen ? 'Open' : 'Closed'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}