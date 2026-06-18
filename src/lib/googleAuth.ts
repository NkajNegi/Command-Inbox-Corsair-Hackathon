import { db } from "@/db";
import { accounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const account = await db.query.accounts.findFirst({
    where: (accounts, { and, eq }) => and(eq(accounts.userId, userId), eq(accounts.provider, "google"))
  });

  if (!account?.access_token) return null;

  // Check if token is expired or expires in less than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = account.expires_at || 0;
  
  if (now >= expiresAt - 300) {
    if (!account.refresh_token) {
      console.warn("Google access token expired and no refresh_token available for user", userId);
      return null;
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: account.refresh_token,
        }),
        method: "POST",
      });

      const tokens = await response.json();

      if (!response.ok) {
        console.error("Failed to refresh Google token:", tokens);
        return null;
      }

      const newExpiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

      await db.update(accounts)
        .set({
          access_token: tokens.access_token,
          expires_at: newExpiresAt,
          refresh_token: tokens.refresh_token ?? account.refresh_token // Fallback to old refresh token if Google doesn't return a new one
        })
        .where(and(eq(accounts.provider, "google"), eq(accounts.providerAccountId, account.providerAccountId)));

      return tokens.access_token;
    } catch (error) {
      console.error("Error attempting to refresh Google access token:", error);
      return null;
    }
  }

  return account.access_token;
}
