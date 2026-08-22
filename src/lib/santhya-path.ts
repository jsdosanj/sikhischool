import { eq, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import { scriptureStages, scriptureSections, scripturePages } from "../../drizzle/schema";

// scriptureSections.textRef marks a migrated corpus as "sikhischool:scripture_pages:<source>"
// (see scripts/migrate_gurbani_corpus.py) — distinct from the "sikh-archive:GURBANI_DB:<code>"
// marker some other sections still carry, which points at a source not yet migrated.
export function migratedScriptureSource(textRef: string | null): string | null {
  if (!textRef?.startsWith("sikhischool:scripture_pages:")) return null;
  return textRef.split(":")[2] ?? null;
}

// DB ids are "stage-<slug>" / "section-<slug>" (see scripts/migrate-santhya-path.ts) —
// URLs use the bare slug.
export function stageSlug(stageId: string): string {
  return stageId.replace(/^stage-/, "");
}

export async function getStages() {
  const db = await getDb();
  const stages = await db.select().from(scriptureStages).orderBy(scriptureStages.order);
  const sections = await db.select().from(scriptureSections).orderBy(scriptureSections.order);
  return stages.map((stage) => ({
    ...stage,
    slug: stageSlug(stage.id),
    section: sections.find((s) => s.stageId === stage.id) ?? null,
  }));
}

export async function getStageBySlug(slug: string) {
  const db = await getDb();
  const stage = await db
    .select()
    .from(scriptureStages)
    .where(eq(scriptureStages.id, `stage-${slug}`))
    .get();
  if (!stage) return null;
  const section = await db
    .select()
    .from(scriptureSections)
    .where(eq(scriptureSections.stageId, stage.id))
    .get();
  return { ...stage, slug, section: section ?? null };
}

// Real, migrated verbatim scripture text (Gurmukhi + line-by-line Punjabi meaning)
// for one page/ang of a source (G|D|B) — see migratedScriptureSource() above.
export async function getScripturePage(source: string, pageNumber: number) {
  const db = await getDb();
  const row = await db
    .select()
    .from(scripturePages)
    .where(and(eq(scripturePages.source, source), eq(scripturePages.pageNumber, pageNumber)))
    .get();
  if (!row) return null;
  return { ...row, payload: JSON.parse(row.payload) as ScripturePagePayload };
}

export async function getScripturePageRange(source: string): Promise<{ min: number; max: number } | null> {
  const db = await getDb();
  const row = await db
    .select({ min: sql<number>`MIN(${scripturePages.pageNumber})`, max: sql<number>`MAX(${scripturePages.pageNumber})` })
    .from(scripturePages)
    .where(eq(scripturePages.source, source))
    .get();
  if (!row || row.min == null) return null;
  return row;
}

// The source's own structured shape (BaniDB-derived) — see the migration script's
// header comment for provenance. Shape varies slightly by source: SGGS pages carry
// `full_page.gurmukhi` (the whole ang as one block) alongside per-line `translations`
// with an explicit `line_number`; Dasam/Sarbloh pages carry only `translations`, with
// no `full_page` and no `line_number` (use array index instead). `translations` is
// always present and is what the reader renders line-by-line.
export interface ScripturePagePayload {
  text_name?: string;
  language?: string;
  ang?: number;
  page?: number;
  pageNumber?: number;
  full_page?: { gurmukhi: string; transliteration?: string; translation?: string };
  translations: { gurmukhi: string; translation?: string; explanation?: string; line_number?: number }[];
}
