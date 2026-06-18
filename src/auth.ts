import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"

if (!process.env.GOOGLE_CLIENT_ID) console.error("CRITICAL: GOOGLE_CLIENT_ID is missing!");
if (!process.env.GOOGLE_CLIENT_SECRET) console.error("CRITICAL: GOOGLE_CLIENT_SECRET is missing!");
if (!process.env.AUTH_SECRET) console.error("CRITICAL: AUTH_SECRET is missing!");

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "database",
    maxAge: 24 * 60 * 60, // 24 hours (in seconds)
    updateAge: 60 * 60, // Update session in database every 1 hour
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://mail.google.com/"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
})
