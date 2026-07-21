'use server'

import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'


export async function applyToRole(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== 'CANDIDATE') {
    throw new Error('Unauthorized')
  }

  const roleId = formData.get('roleId') as string
  const resume = formData.get('resume') as File

  if (!roleId || !resume || resume.size === 0) {
    throw new Error('Resume file is required')
  }
  if (resume.type !== 'application/pdf') {
    throw new Error('Only PDF resumes are accepted')
  }
  if (resume.size > 5 * 1024 * 1024) {
    throw new Error('Resume must be under 5MB')
  }

  const blob = await put(`resumes/${session.user.id}-${Date.now()}.pdf`, resume, {
    access: 'public',
  })

  await prisma.application.create({
    data: {
      candidateId: session.user.id,
      roleId,
      resumeUrl: blob.url,
    },
  })

  revalidatePath('/candidate/applications')
  revalidatePath('/dashboard')
  revalidatePath('/recruiter/applications')
}

export async function getApplicationsForRecruiter() {
  return prisma.application.findMany({
    include: {
      candidate: true,
      role: { include: { client: true } },
      interview: { include: { questions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getMyApplications() {
  const session = await auth()
  if (!session) return []
  return prisma.application.findMany({
    where: { candidateId: session.user.id },
    include: { role: { include: { client: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function shortlistApplication(applicationId: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== 'RECRUITER') {
    throw new Error('Unauthorized')
  }
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'SHORTLISTED', createdByUserId: session.user.id },
  })
  await prisma.interview.upsert({
    where: { applicationId },
    update: {},
    create: { applicationId, status: 'SCHEDULED' },
  })
  revalidatePath('/recruiter/applications')
}

export async function rejectApplication(applicationId: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== 'RECRUITER') {
    throw new Error('Unauthorized')
  }
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'REJECTED', decidedByUserId: session.user.id },
  })
  revalidatePath('/recruiter/applications')
}