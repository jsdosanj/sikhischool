import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, getChildrenWithProgress } from "@/lib/lessons";
import { getQuizQuestionsForClient } from "@/lib/quizzes";
import { GRADE_BAND_ORDER } from "@/lib/courses";
import { shellForGradeBand } from "@/design/tokens";
import { GRADE_ORDER } from "@/lib/grades";
import { getCurrentParent, getChildren } from "@/lib/session";
import Shell from "@/components/shells/Shell";
import SunFriend from "@/components/shells/SunFriend";
import WorksheetDownloadButton from "@/components/worksheets/WorksheetDownloadButton";
import MarkCompleteWidget from "@/components/MarkCompleteWidget";
import QuizWidget from "@/components/QuizWidget";
import LessonContentBlock from "@/components/LessonContentBlock";
import LessonActivities from "@/components/games/LessonActivities";
import type { ActivityRef } from "@/components/games/types";

// Server-rendered on demand — see src/app/courses/page.tsx for why.
export const dynamic = "force-dynamic";

function gradeBandForLevel(gradeLevel: string): string {
  const i = GRADE_ORDER.indexOf(gradeLevel);
  if (i <= 2) return "K-2";
  if (i <= 5) return "3-5";
  if (i <= 8) return "6-8";
  return GRADE_BAND_ORDER[3];
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const result = await getLesson(lessonId);
  if (!result) notFound();
  const { lesson, guide, worksheet } = result;

  const contentBlocks = lesson.contentBlocks as { type: string; ref?: string; text?: string; src?: string; caption?: string }[];
  const enrichmentLinks = lesson.enrichmentLinks as { label: string; url: string; source: string }[];
  const activityRefs = lesson.activityRefs as ActivityRef[];
  const shell = shellForGradeBand(gradeBandForLevel(lesson.gradeLevel));
  const little = shell === "little-sparks";
  const hasGurmukhi = lesson.subject === "punjabi" || lesson.subject === "sikhi";

  const parent = await getCurrentParent();
  const children = parent ? await getChildren(parent.id) : [];
  const alreadyDoneChildIds = children.length
    ? await getChildrenWithProgress(
        children.map((c) => c.id),
        lessonId,
      )
    : [];
  const quiz = lesson.masteryQuizId ? await getQuizQuestionsForClient(lesson.masteryQuizId) : null;

  return (
    <Shell shell={shell}>
      <main className={`mx-auto w-full flex-1 p-8 ${little ? "max-w-xl" : "max-w-2xl"}`}>
        <Link
          href={`/courses/${id}`}
          className="text-sm opacity-60 hover:underline"
          style={{ color: "var(--shell-ink)" }}
        >
          &larr; Back to course
        </Link>

        {little && (
          <div className="mt-4 flex justify-center">
            <SunFriend size={80} mood="happy" />
          </div>
        )}

        {lesson.aiGenerated && (
          <p
            className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "color-mix(in srgb, var(--shell-accent) 18%, transparent)" }}
          >
            Created by AI &middot; {lesson.aiReviewStatus === "pending" ? "pending scholar review" : lesson.aiReviewStatus}
          </p>
        )}

        <h1
          className={`mt-3 font-bold ${little ? "text-4xl text-center" : "text-2xl"}`}
          style={{ fontFamily: "var(--shell-display-font)" }}
        >
          {lesson.title}
        </h1>

        <section
          className={`mt-6 flex flex-col gap-4 ${little ? "text-lg text-center" : ""}`}
          style={hasGurmukhi ? { fontFamily: "var(--font-gurmukhi), var(--shell-body-font)" } : undefined}
        >
          {contentBlocks.map((block, i) => (
            <LessonContentBlock key={i} block={block} />
          ))}
        </section>

        {enrichmentLinks.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {enrichmentLinks.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                className="text-sm font-semibold underline"
                style={{ color: "var(--shell-accent)" }}
              >
                {link.label} &rarr;
              </Link>
            ))}
          </div>
        )}

        {/* Practice follows the content rather than competing with it for
            attention (design review §15, Pass 1's information hierarchy). */}
        <LessonActivities
          lessonId={lessonId}
          activityRefs={activityRefs}
          kids={children.map((c) => ({ id: c.id, displayName: c.displayName }))}
        />

        {worksheet && (
          <div className={`mt-8 ${little ? "flex justify-center" : ""}`}>
            <WorksheetDownloadButton
              templateKey={worksheet.generationTemplateKey ?? ""}
              title={worksheet.title}
              data={(worksheet.generationData as Record<string, unknown>) ?? {}}
              gradeLevel={lesson.gradeLevel}
              subject={lesson.subject}
            />
          </div>
        )}

        {children.length > 0 && quiz && (
          <QuizWidget
            quizId={quiz.id}
            lessonId={lessonId}
            kids={children.map((c) => ({ id: c.id, displayName: c.displayName }))}
            questions={quiz.questions}
          />
        )}

        {children.length > 0 && !quiz && (
          <MarkCompleteWidget
            lessonId={lessonId}
            kids={children.map((c) => ({ id: c.id, displayName: c.displayName }))}
            alreadyDoneChildIds={alreadyDoneChildIds}
          />
        )}

        {guide && (
          <details
            className="mt-8 p-4"
            style={{
              borderRadius: "var(--shell-radius)",
              border: "1px solid color-mix(in srgb, var(--shell-ink) 15%, transparent)",
              background: "var(--shell-surface)",
            }}
          >
            <summary className="cursor-pointer font-semibold">For teachers &amp; homeschool parents</summary>
            <div className="mt-4 flex flex-col gap-4 text-sm">
              <div>
                <p className="font-semibold">Objectives</p>
                <ul className="mt-1 list-disc ps-5">
                  {(guide.objectives as string[]).map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold">Materials needed</p>
                <ul className="mt-1 list-disc ps-5">
                  {(guide.materialsNeeded as string[]).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold">How to teach it ({guide.estimatedMinutes} min)</p>
                <p className="mt-1 whitespace-pre-line opacity-90">{guide.facilitationScript}</p>
              </div>
              <div>
                <p className="font-semibold">Differentiation</p>
                <ul className="mt-1 list-disc ps-5">
                  {(guide.differentiationTips as string[]).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              {guide.answerKey && (
                <div>
                  <p className="font-semibold">Answer key</p>
                  <p className="mt-1 opacity-90">{guide.answerKey}</p>
                </div>
              )}
            </div>
          </details>
        )}
      </main>
    </Shell>
  );
}
