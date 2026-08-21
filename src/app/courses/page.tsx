import Link from "next/link";
import { getAllCourses, GRADE_BAND_ORDER, SUBJECT_LABELS } from "@/lib/courses";

// Server-rendered on demand — queries live D1, which isn't reachable at build
// time (no Workers bindings outside the deployed runtime).
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const allCourses = await getAllCourses();

  return (
    <main className="mx-auto max-w-4xl flex-1 p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        K-12 &middot; All subjects
      </p>
      <h1 className="mt-1 text-3xl font-bold">Courses</h1>
      <p className="mt-3 text-[var(--foreground)]/70">
        Every grade, every subject — math, English, science, social studies, Punjabi, and Sikhi,
        plus life skills and digital literacy. The full map is here even where a course&apos;s
        lessons are still being written.
      </p>

      {GRADE_BAND_ORDER.map((band) => {
        const bandCourses = allCourses.filter((c) => c.gradeBand === band);
        if (bandCourses.length === 0) return null;
        return (
          <section key={band} className="mt-10">
            <h2 className="text-xl font-bold">Grades {band}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {bandCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="block h-full rounded-lg border border-[var(--foreground)]/15 p-4 transition hover:border-[var(--color-saffron)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/50">
                      {SUBJECT_LABELS[course.subject] ?? course.subject}
                    </p>
                    <p className="mt-0.5 font-medium">{course.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
