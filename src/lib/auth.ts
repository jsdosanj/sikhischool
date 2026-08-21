import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Resend } from "resend";
import { getDb } from "./db";
import { parentAccounts, users, accounts, sessions, verificationTokens } from "../../drizzle/schema";

// Magic-link email auth, same identity shape as sikhiuni — ParentAccount and
// TeacherAccount are both adult, directly-authenticating identities that sign
// in this way. ChildProfile never authenticates directly (see CLAUDE.md).
//
// Built fresh per request (not cached at module scope): the D1 binding is only
// available inside the Workers runtime's per-request async context.
export async function getAuthOptions(): Promise<NextAuthOptions> {
  const db = await getDb();
  return {
    // Without an explicit schema, the adapter assumes its own default table
    // names ("user", "account", singular) and silently queries tables that
    // don't exist in our D1 database — every auth action 500s. Point it at
    // our actual tables (see drizzle/schema.ts).
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    session: { strategy: "database" },
    // Explicit, not left to per-entry-point defaulting: the Email provider's
    // verification-token hash (core/lib/utils.js hashToken) depends on this
    // secret, and getServerSession/the signin+callback handlers don't
    // necessarily default it the same way.
    secret: process.env.NEXTAUTH_SECRET,
    events: {
      // First sign-in for this email — auto-provision the app-level ParentAccount
      // profile. (Auth.js's own `users` table is just the authentication identity;
      // ParentAccount holds the app-specific profile a ChildProfile links to.)
      // Teacher signup is a separate, not-yet-built flow — see the plan's Wave 1b notes.
      createUser: async ({ user }) => {
        if (!user.email) return;
        await db.insert(parentAccounts).values({
          id: crypto.randomUUID(),
          email: user.email,
          name: user.name ?? null,
          createdAt: new Date(),
        });
      },
    },
    providers: [
      EmailProvider({
        from: "Sikhi School <login@dosanjhlabs.com>",
        sendVerificationRequest: async ({ identifier, url }) => {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "Sikhi School <login@dosanjhlabs.com>",
            to: identifier,
            subject: "Your Sikhi School sign-in link",
            html: `<p>Sign in to Sikhi School:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
          });
        },
      }),
    ],
  };
}
