import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { scriptureStages, scriptureSections } from "../../drizzle/schema";

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
