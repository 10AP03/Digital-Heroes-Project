'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/hash'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['RECRUITER', 'CANDIDATE']),
})

export async function registerUser(formData: FormData): Promise<void> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    throw new Error('An account with this email already exists')
  }

  const hashed = await hashPassword(parsed.data.password)

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      role: parsed.data.role,
    },
  })

  redirect('/login')
}