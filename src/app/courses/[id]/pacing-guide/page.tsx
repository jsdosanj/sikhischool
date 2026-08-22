import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, SUBJECT_LABELS } from "@/lib/courses";
import { getPacingGuide } from "@/lib/pacing-guides";
import { shellForGradeBand } from "@/design/tokens";
import Shell from "@/components/shells/Shell";

// Server-rendered on demand — see src/app/courses/page.tsx for why.
export const dynamic = "force-dynamic";

export default async function PacingGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const guide = await getPacingGuide(id);
  const shell = shellForGradeBand(course.gradeBand);
  const sequence = (guide?.weekByWeekSequence ?? []) as { week: number; unitId: string; summary: string }[];

  return (
    <Shell shell={shell}>
      <main className="mx-auto w-full max-w-2xl flex-1 p-8">
        <Link href={`/courses/${course.id}`} className="text-sm opacity-60 hover:underline">
          &larr; {course.title}
        </Link>
        <p className="mt-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--shell-accent)" }}>
          Pacing Guide &middot; {SUBJECT_LABELS[course.subject] ?? course.subject}
        </p>
        <h1 className="mt-1 text-3xl font-bold" style={{ fontFamily: "var(--shell-display-font)" }}>
          {course.title}
        </h1>
        <p className="mt-4 opacity-80">
          A week-by-week scope-and-sequence for this course, generated from its published units — the shape of the
          full year at a glance, even while later weeks are still being written.
        </p>

        {sequence.length === 0 ? (
          <p
            className="mt-8 p-5 text-sm opacity-80"
            style={{
              borderRadius: "var(--shell-radius)",
              border: "1px solid color-mix(in srgb, var(--shell-ink) 15%, transparent)",
              background: "var(--shell-surface)",
            }}
          >
            This course&apos;s pacing guide is still being written — check back soon.
          </p>
        ) : (
          <ol className="mt-8 flex flex-col gap-2">
            {sequence.map((entry) => (
              <li
                key={entry.unitId}
                className="flex items-baseline justify-between gap-4 p-3 text-sm"
                style={{
                  borderRadius: "var(--shell-radius)",
                  border: "1px solid color-mix(in srgb, var(--shell-ink) 15%, transparent)",
                  background: "var(--shell-surface)",
                }}
              >
                <span className="font-medium">Week {entry.week}</span>
                <Link
                  href={`/courses/${course.id}`}
                  className="text-right hover:underline"
                  style={{ color: "var(--shell-accent)" }}
                >
                  {entry.summary}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </Shell>
  );
}
