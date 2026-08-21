import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, SUBJECT_LABELS } from "@/lib/courses";
import { getUnitsForCourse, getLessonsForUnit } from "@/lib/lessons";
import { shellForGradeBand } from "@/design/tokens";
import Shell from "@/components/shells/Shell";
import SunFriend from "@/components/shells/SunFriend";

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

  const shell = shellForGradeBand(course.gradeBand);
  const little = shell === "little-sparks";

  return (
    <Shell shell={shell}>
      <main className={`mx-auto w-full flex-1 p-8 ${little ? "max-w-xl" : "max-w-3xl"}`}>
        <Link href="/courses" className="text-sm opacity-60 hover:underline">
          &larr; Courses
        </Link>

        {little && (
          <div className="mt-4 flex justify-center">
            <SunFriend size={72} />
          </div>
        )}

        <p
          className={`mt-3 text-sm font-semibold uppercase tracking-wide ${little ? "text-center" : ""}`}
          style={{ color: "var(--shell-accent)" }}
        >
          {SUBJECT_LABELS[course.subject] ?? course.subject} &middot; Grade{" "}
          {course.gradeLevel === course.gradeBand ? course.gradeBand : course.gradeLevel}
        </p>
        <h1
          className={`mt-1 font-bold ${little ? "text-4xl text-center" : "text-3xl"}`}
          style={{ fontFamily: "var(--shell-display-font)" }}
        >
          {course.title}
        </h1>
        <p className={`mt-4 opacity-80 ${little ? "text-center text-lg" : ""}`}>{course.description}</p>

        {unitsWithLessons.length === 0 ? (
          <p
            className="mt-8 p-5 text-sm opacity-80"
            style={{
              borderRadius: "var(--shell-radius)",
              border: "1px solid color-mix(in srgb, var(--shell-ink) 15%, transparent)",
              background: "var(--shell-surface)",
            }}
          >
            This course&apos;s units and lessons are still being written — check back soon.
          </p>
        ) : (
          <ol className="mt-8 flex flex-col gap-4">
            {unitsWithLessons.map(({ unit, lessons: unitLessons }) => (
              <li
                key={unit.id}
                className="p-4"
                style={{
                  borderRadius: "var(--shell-radius)",
                  border: "1px solid color-mix(in srgb, var(--shell-ink) 15%, transparent)",
                  background: "var(--shell-surface)",
                }}
              >
                <h2 className="font-semibold" style={{ fontFamily: "var(--shell-display-font)" }}>
                  Unit {unit.order} &middot; {unit.title}
                </h2>
                {unitLessons.length === 0 ? (
                  <p className="mt-1 text-sm opacity-60">Lessons coming soon.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1">
                    {unitLessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/courses/${course.id}/lessons/${lesson.id}`}
                          className="text-sm hover:underline"
                          style={{ color: "var(--shell-accent)" }}
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
    </Shell>
  );
}
