import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Resend } from "resend";
import { getDb } from "./db";

// Magic-link email auth, same identity shape as sikhiuni — ParentAccount and
// TeacherAccount are both adult, directly-authenticating identities that sign
// in this way. ChildProfile never authenticates directly (see CLAUDE.md).
//
// Built fresh per request (not cached at module scope): the D1 binding is only
// available inside the Workers runtime's per-request async context.
export async function getAuthOptions(): Promise<NextAuthOptions> {
  const db = await getDb();
  return {
    adapter: DrizzleAdapter(db),
    session: { strategy: "database" },
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
