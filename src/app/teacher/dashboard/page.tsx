import { redirect } from "next/navigation";
import { getOrCreateCurrentTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const teacher = await getOrCreateCurrentTeacher();
  if (!teacher) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl flex-1 p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        Teacher dashboard
      </p>
      <h1 className="mt-1 text-2xl font-bold">{teacher.email}</h1>

      <p className="mt-8 rounded-lg border border-[var(--foreground)]/15 p-5 text-sm text-[var(--foreground)]/70">
        Classroom rostering and the gradebook are still being built — check back soon. Your
        account is ready for when they land.
      </p>
    </main>
  );
}
