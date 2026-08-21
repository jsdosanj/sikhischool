import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

// Resolved per request, not at module load — see the comment in lib/auth.ts.
// next-auth v4's App Router shim reads the catch-all segment from `context.params`
// (not `req.query`, which doesn't exist on App Router's Request) — the handler
// signature must accept and forward that second argument, or every action
// (csrf, session, signin, callback...) fails with "Cannot destructure 'nextauth'".
async function handler(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const options = await getAuthOptions();
  return NextAuth(options)(req, context);
}

export { handler as GET, handler as POST };
