import { redirect } from "next/navigation";
import { getOrCreateCurrentTeacher } from "@/lib/session";
import { getClassroomsForTeacher, getRoster } from "@/lib/classrooms";
import CreateClassroomForm from "./CreateClassroomForm";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const teacher = await getOrCreateCurrentTeacher();
  if (!teacher) redirect("/login");

  const classrooms = await getClassroomsForTeacher(teacher.id);
  const rosters = await Promise.all(classrooms.map((c) => getRoster(c.id)));

  return (
    <main className="mx-auto max-w-2xl flex-1 p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        Teacher dashboard
      </p>
      <h1 className="mt-1 text-2xl font-bold">{teacher.email}</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Your classrooms</h2>
        {classrooms.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--foreground)]/70">
            No classrooms yet — create one below and share its join code with families.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {classrooms.map((classroom, i) => (
              <li key={classroom.id} className="rounded-lg border border-[var(--foreground)]/15 p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{classroom.name}</span>
                  <span className="rounded bg-[var(--color-saffron)]/15 px-2 py-0.5 font-mono text-xs tracking-wider">
                    {classroom.joinCode}
                  </span>
                </div>
                {rosters[i].length === 0 ? (
                  <p className="mt-2 text-[var(--foreground)]/60">
                    No students enrolled yet — share the join code above.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 text-[var(--foreground)]/80">
                    {rosters[i].map((student) => (
                      <li key={student.id}>
                        {student.displayName} &middot;{" "}
                        {student.gradeLevel === "K" ? "Kindergarten" : `Grade ${student.gradeLevel}`}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
        <CreateClassroomForm />
      </section>

      <p className="mt-8 rounded-lg border border-[var(--foreground)]/15 p-5 text-sm text-[var(--foreground)]/70">
        The full gradebook is still being built — check back soon.
      </p>
    </main>
  );
}
