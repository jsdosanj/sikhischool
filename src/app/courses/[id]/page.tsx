import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, SUBJECT_LABELS } from "@/lib/courses";
import { getUnitsForCourse, getLessonsForUnit } from "@/lib/lessons";

// Server-rendered on demand — see src/app/courses/page.tsx for why.
export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const courseUnits = await getUnitsForCourse(id);
  const unitsWithLessons = await Promise.all(
    courseUnits.map(async (unit) => ({ unit, lessons: await getLessonsForUnit(unit.id) })),
  );

  return (
    <main className="mx-auto max-w-3xl flex-1 p-8">
      <Link href="/courses" className="text-sm text-[var(--foreground)]/60 hover:underline">
        &larr; Courses
      </Link>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        {SUBJECT_LABELS[course.subject] ?? course.subject} &middot; Grade{" "}
        {course.gradeLevel === course.gradeBand ? course.gradeBand : course.gradeLevel}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{course.title}</h1>
      <p className="mt-4 text-[var(--foreground)]/70">{course.description}</p>

      {unitsWithLessons.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--foreground)]/15 p-5 text-sm text-[var(--foreground)]/70">
          This course&apos;s units and lessons are still being written — check back soon.
        </p>
      ) : (
        <ol className="mt-8 flex flex-col gap-4">
          {unitsWithLessons.map(({ unit, lessons: unitLessons }) => (
            <li key={unit.id} className="rounded-lg border border-[var(--foreground)]/15 p-4">
              <h2 className="font-semibold">
                Unit {unit.order} &middot; {unit.title}
              </h2>
              {unitLessons.length === 0 ? (
                <p className="mt-1 text-sm text-[var(--foreground)]/60">Lessons coming soon.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {unitLessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="text-sm text-[var(--color-saffron)] hover:underline"
                      >
                        Day {lesson.dayOfWeek} &middot; {lesson.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
