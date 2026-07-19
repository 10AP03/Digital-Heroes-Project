'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    const res = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="max-w-sm mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="email" type="email" placeholder="Email" required
          className="w-full border rounded px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required
          className="w-full border rounded px-3 py-2" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="w-full bg-black text-white rounded px-4 py-2">
          Log in
        </button>
      </form>

      <p className="text-sm text-gray-500">
        No account? <a href="/register" className="underline">Register</a>
      </p>
    </div>
  )
}