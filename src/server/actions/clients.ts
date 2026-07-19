'use server'

import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== 'RECRUITER') {
    throw new Error('Unauthorized')
  }

  const parsed = clientSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await prisma.client.create({ data: parsed.data })
  revalidatePath('/recruiter/clients')
}

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: { roles: true },
  })
}

export async function getClient(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: { roles: { orderBy: { createdAt: 'desc' } } },
  })
}