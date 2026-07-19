import NextAuth from "next-auth";
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client"; // matches the output path in schema.prisma
import { PrismaPg } from "@prisma/adapter-pg";
import { UserRole } from '@/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


// - handlers: plugs into your API route so login/logout requests work
export const { handlers, auth, signIn, signOut } = NextAuth({
  
  session: { strategy: "jwt" },
  ...authConfig,

  providers: [
    Credentials({
      name: "credentials",
      credentials: 
      {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // This function runs every time someone tries to log in.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(         // We never store or compare plain-text passwords.
          credentials.password as string,
          user.password
        );

        if (!isValidPassword) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, 
        };
      },
    }),
  ],

  
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = (user as { role: UserRole }).role;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
    }
    return session;
  },
},
pages: {
  signIn: "/login",
},})