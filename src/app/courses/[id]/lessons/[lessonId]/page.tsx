import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/lessons";
import WorksheetDownloadButton from "@/components/worksheets/WorksheetDownloadButton";

// Server-rendered on demand — see src/app/courses/page.tsx for why.
export const dynamic = "force-dynamic";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const result = await getLesson(lessonId);
  if (!result) notFound();
  const { lesson, guide, worksheet } = result;

  const contentBlocks = lesson.contentBlocks as { type: string; ref?: string; text?: string }[];

  return (
    <main className="mx-auto max-w-2xl flex-1 p-8">
      <Link href={`/courses/${id}`} className="text-sm text-[var(--foreground)]/60 hover:underline">
        &larr; Back to course
      </Link>
      {lesson.aiGenerated && (
        <p className="mt-3 inline-block rounded bg-[var(--color-saffron)]/15 px-2 py-1 text-xs font-semibold">
          Created by AI &middot; {lesson.aiReviewStatus === "pending" ? "pending scholar review" : lesson.aiReviewStatus}
        </p>
      )}
      <h1 className="mt-3 text-2xl font-bold">{lesson.title}</h1>

      <section className="mt-6 flex flex-col gap-4">
        {contentBlocks.map((block, i) => (
           
          <p key={i} className="text-[var(--foreground)]/85 leading-relaxed">
            {block.text}
          </p>
        ))}
      </section>

      {worksheet && (
        <div className="mt-8">
          <WorksheetDownloadButton
            templateKey={worksheet.generationTemplateKey ?? ""}
            title={worksheet.title}
            data={(worksheet.generationData as Record<string, unknown>) ?? {}}
          />
        </div>
      )}

      {guide && (
        <details className="mt-8 rounded-lg border border-[var(--foreground)]/15 p-4">
          <summary className="cursor-pointer font-semibold">For teachers &amp; homeschool parents</summary>
          <div className="mt-4 flex flex-col gap-4 text-sm">
            <div>
              <p className="font-semibold">Objectives</p>
              <ul className="mt-1 list-disc pl-5">
                {(guide.objectives as string[]).map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Materials needed</p>
              <ul className="mt-1 list-disc pl-5">
                {(guide.materialsNeeded as string[]).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">How to teach it ({guide.estimatedMinutes} min)</p>
              <p className="mt-1 whitespace-pre-line text-[var(--foreground)]/85">{guide.facilitationScript}</p>
            </div>
            <div>
              <p className="font-semibold">Differentiation</p>
              <ul className="mt-1 list-disc pl-5">
                {(guide.differentiationTips as string[]).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            {guide.answerKey && (
              <div>
                <p className="font-semibold">Answer key</p>
                <p className="mt-1 text-[var(--foreground)]/85">{guide.answerKey}</p>
              </div>
            )}
          </div>
        </details>
      )}
    </main>
  );
}
