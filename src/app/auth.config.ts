import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user
    },
  },
  providers: [], // filled in by auth.ts
} satisfies NextAuthConfig