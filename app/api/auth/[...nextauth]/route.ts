import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'users.json')

function getUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const users = getUsers()
        const user = users.find(
          (u: any) =>
            u.username.toLowerCase() === credentials.username.toLowerCase()
        )

        if (!user) return null

        const passwordValid = await bcrypt.compare(credentials.password, user.password)
        if (!passwordValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = (user as any).username
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).username = token.username
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'aerosepct-super-secret-key-change-in-production',
})

export { handler as GET, handler as POST }
