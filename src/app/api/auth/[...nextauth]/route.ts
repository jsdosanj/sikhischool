import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

// Resolved per request, not at module load — see the comment in lib/auth.ts.
async function handler(req: Request) {
  const options = await getAuthOptions();
  return NextAuth(options)(req);
}

export { handler as GET, handler as POST };
