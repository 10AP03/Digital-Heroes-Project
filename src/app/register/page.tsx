import { registerUser } from '@/server/actions/auth'

export default function RegisterPage() {
  return (
    <div className="max-w-sm mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Create account</h1>

      <form action={registerUser} className="space-y-3">
        <input name="name" placeholder="Full name" required
          className="w-full border rounded px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required
          className="w-full border rounded px-3 py-2" />
        <input name="password" type="password" placeholder="Password (min 8 chars)" required
          minLength={8}
          className="w-full border rounded px-3 py-2" />

        <select name="role" required className="w-full border rounded px-3 py-2">
          <option value="">Select role</option>
          <option value="RECRUITER">Recruiter</option>
          <option value="CANDIDATE">Candidate</option>
        </select>

        <button type="submit" className="w-full bg-black text-white rounded px-4 py-2">
          Register
        </button>
      </form>

      <p className="text-sm text-gray-500">
        Already have an account? <a href="/login" className="underline">Log in</a>
      </p>
    </div>
  )
}