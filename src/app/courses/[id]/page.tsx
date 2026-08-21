import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, SUBJECT_LABELS } from "@/lib/courses";

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

      <p className="mt-8 rounded-lg border border-[var(--foreground)]/15 p-5 text-sm text-[var(--foreground)]/70">
        This course&apos;s units and lessons are still being written — check back soon.
      </p>
    </main>
  );
}
