import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { dictionary } from "../../../../../drizzle/schema";

// Word lookup behind the [[word]] reading affordance (plan §5 D4).
//
// Deliberately unauthenticated: dictionary rows are public educational content
// with no PII and nothing user-owned, so the ownership/session checks the
// progress and classroom routes carry would be cargo-culted here, not security.
//
// A miss returns 200 with a `null` body rather than 404. Content is authored
// ahead of its dictionary rows on purpose, so "this word isn't in the
// dictionary yet" is an expected state the UI renders as a message — not an
// error the client has to distinguish from a genuinely broken request.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const word = params.get("word")?.trim();
  const language = params.get("language")?.trim();

  if (!word || !language) {
    return NextResponse.json({ error: "word and language are required." }, { status: 400 });
  }

  const db = await getDb();

  // Exact match, case-insensitively — no fuzzy/prefix fallback. A near-miss
  // definition on a reading passage is worse than none: a child sounding out a
  // word would be shown the wrong meaning with no signal that it's wrong.
  const entry = await db
    .select({
      word: dictionary.word,
      translation: dictionary.translation,
      partOfSpeech: dictionary.partOfSpeech,
      synonyms: dictionary.synonyms,
      exampleSentence: dictionary.exampleSentence,
      audioRef: dictionary.audioRef,
    })
    .from(dictionary)
    .where(
      and(
        eq(sql`lower(${dictionary.word})`, word.toLowerCase()),
        eq(sql`lower(${dictionary.language})`, language.toLowerCase()),
      ),
    )
    .get();

  return NextResponse.json(entry ?? null);
}
