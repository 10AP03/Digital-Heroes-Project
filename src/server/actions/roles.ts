'use server'

import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { roleSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

export async function createRole(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== 'RECRUITER') {
    throw new Error('Unauthorized')
  }

  const parsed = roleSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    questionCount: formData.get('questionCount'),
    clientId: formData.get('clientId'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await prisma.role.create({ data: parsed.data })
  revalidatePath(`/recruiter/clients/${parsed.data.clientId}`)
  revalidatePath('/candidate/roles')
}

export async function getOpenRoles() {
  return prisma.role.findMany({
    where: { isOpen: true },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRole(roleId: string) {
  return prisma.role.findUnique({
    where: { id: roleId },
    include: { client: true },
  })
}

export async function toggleRoleOpen(roleId: string, isOpen: boolean) {
  const session = await auth()
  if (!session || session.user.role !== 'RECRUITER') {
    return { error: 'Unauthorized' }
  }
  await prisma.role.update({ where: { id: roleId }, data: { isOpen } })
  revalidatePath('/recruiter')
  revalidatePath('/candidate/roles')
}