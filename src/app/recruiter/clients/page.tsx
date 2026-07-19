import { createClient, getClients } from '@/server/actions/clients'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <a href="/dashboard" className="text-sm text-gray-500 hover:underline">← Dashboard</a>
      <h1 className="text-2xl font-semibold">Clients</h1>

      <form action={createClient} className="space-y-3 border rounded-lg p-4">
        <input name="name" placeholder="Client name" required
          className="w-full border rounded px-3 py-2" />
        <textarea name="description" placeholder="Description (optional)"
          className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-black text-white rounded px-4 py-2">
          Add Client
        </button>
      </form>

      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.id} className="border rounded-lg p-4">
            <a href={`/recruiter/clients/${c.id}`} className="font-medium hover:underline">
              {c.name}
            </a>
            <p className="text-sm text-gray-500">{c.roles.length} role(s)</p>
          </li>
        ))}
      </ul>
    </div>
  )
}