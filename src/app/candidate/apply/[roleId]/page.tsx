import { getRole } from '@/server/actions/roles'
import { applyToRole } from '@/server/actions/applications'
import { notFound } from 'next/navigation'

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  const { roleId } = await params
  const role = await getRole(roleId)
  if (!role) notFound()

  return (
    <div className="max-w-md mx-auto p-8 space-y-6">
      <a href="/candidate/roles" className="text-sm text-gray-500 hover:underline">← Roles</a>
      <h1 className="text-2xl font-semibold">{role.title}</h1>
      <p className="text-gray-600">{role.description}</p>

      <form action={applyToRole} className="space-y-3 border rounded-lg p-4">
        <input type="hidden" name="roleId" value={roleId} />
        <input type="file" name="resume" accept="application/pdf" required
          className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-black text-white rounded px-4 py-2">
          Submit Application
        </button>
      </form>
    </div>
  )
}