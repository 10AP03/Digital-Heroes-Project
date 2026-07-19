import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
})

export const roleSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  questionCount: z.coerce.number().int().min(1).max(15).default(5),
  clientId: z.string().cuid(),
})

export const applicationSchema = z.object({
  roleId: z.string().cuid(),
})