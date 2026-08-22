import Link from "next/link";
import { notFound } from "next/navigation";
import { getStageBySlug, getScripturePage, getScripturePageRange, migratedScriptureSource } from "@/lib/santhya-path";

// Server-rendered on demand — see the stage-index page's own note on why.
export const dynamic = "force-dynamic";

export default async function ScripturePageReader({
  params,
}: {
  params: Promise<{ stage: string; page: string }>;
}) {
  const { stage: slug, page: pageParam } = await params;
  const pageNumber = Number(pageParam);
  const stage = await getStageBySlug(slug);
  if (!stage || !Number.isInteger(pageNumber)) notFound();

  const source = migratedScriptureSource(stage.section?.textRef ?? null);
  if (!source) notFound();

  const [page, range] = await Promise.all([getScripturePage(source, pageNumber), getScripturePageRange(source)]);
  if (!page || !range) notFound();

  const lines = page.payload.translations;
  const prevPage = pageNumber > range.min ? pageNumber - 1 : null;
  const nextPage = pageNumber < range.max ? pageNumber + 1 : null;

  return (
    <main className="mx-auto max-w-3xl flex-1 p-8">
      <Link href={`/santhya-path/${slug}`} className="text-sm text-[var(--foreground)]/60 hover:underline">
        &larr; {stage.title}
      </Link>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        Ang / Page {pageNumber} of {range.max}
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {lines.map((line, i) => (
          <div key={i} className="border-b border-[var(--foreground)]/10 pb-4 last:border-b-0">
            <p lang="pa" className="text-xl leading-relaxed" style={{ fontFamily: "var(--font-gurmukhi), sans-serif" }}>
              {line.gurmukhi}
            </p>
            {line.translation && <p className="mt-1 text-sm text-[var(--foreground)]/70">{line.translation}</p>}
          </div>
        ))}
      </div>

      <nav className="mt-8 flex items-center justify-between text-sm">
        {prevPage ? (
          <Link href={`/santhya-path/${slug}/${prevPage}`} className="hover:underline">
            &larr; Ang {prevPage}
          </Link>
        ) : (
          <span />
        )}
        {nextPage ? (
          <Link href={`/santhya-path/${slug}/${nextPage}`} className="hover:underline">
            Ang {nextPage} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <p className="mt-8 text-xs text-[var(--foreground)]/50">
        Gurmukhi text and line meanings migrated verbatim from a verified source corpus. This is a reading aid, not a
        substitute for a printed Guru Granth Sahib Ji or a scholar&apos;s guidance.
      </p>
    </main>
  );
}
