import { redirect } from "next/navigation";
import { getOrCreateCurrentTeacher } from "@/lib/session";
import { getClassroomsForTeacher, getRoster, getAnnouncementsForClassroom } from "@/lib/classrooms";
import { getQuizProgressForChildren } from "@/lib/grade-overrides";
import CreateClassroomForm from "./CreateClassroomForm";
import AnnouncementForm from "./AnnouncementForm";
import GradeOverrideForm from "./GradeOverrideForm";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const teacher = await getOrCreateCurrentTeacher();
  if (!teacher) redirect("/login");

  const classrooms = await getClassroomsForTeacher(teacher.id);
  const [rosters, classroomAnnouncements] = await Promise.all([
    Promise.all(classrooms.map((c) => getRoster(c.id))),
    Promise.all(classrooms.map((c) => getAnnouncementsForClassroom(c.id))),
  ]);
  const quizProgress = await Promise.all(
    rosters.map((roster) => getQuizProgressForChildren(roster.map((s) => s.id))),
  );

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
                  <ul className="mt-2 flex flex-col gap-2 text-[var(--foreground)]/80">
                    {rosters[i].map((student) => {
                      const studentQuizzes = quizProgress[i].filter((q) => q.childProfileId === student.id);
                      return (
                        <li key={student.id}>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <span>
                              {student.displayName} &middot;{" "}
                              {student.gradeLevel === "K" ? "Kindergarten" : `Grade ${student.gradeLevel}`}
                            </span>
                            <span className="text-xs text-[var(--foreground)]/60">
                              {student.lessonsPassed} lesson{student.lessonsPassed === 1 ? "" : "s"} passed &middot;{" "}
                              {student.badgesEarned} badge{student.badgesEarned === 1 ? "" : "s"}
                            </span>
                          </div>
                          {studentQuizzes.length > 0 && (
                            <ul className="mt-1 flex flex-col gap-1 pl-3 text-xs text-[var(--foreground)]/70">
                              {studentQuizzes.map((q) => (
                                <li key={q.nodeId} className="flex flex-wrap items-center justify-between gap-2">
                                  <span>
                                    {q.lessonTitle}: {q.overrideScore ?? q.masteryPoints}
                                    {q.overrideScore !== null && (
                                      <span className="text-[var(--foreground)]/40"> (auto: {q.masteryPoints})</span>
                                    )}
                                  </span>
                                  <GradeOverrideForm
                                    classroomId={classroom.id}
                                    studentId={student.id}
                                    nodeId={q.nodeId}
                                    currentOverride={q.overrideScore}
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="mt-3 border-t border-[var(--foreground)]/10 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/60">
                    Announcements
                  </p>
                  {classroomAnnouncements[i].length === 0 ? (
                    <p className="mt-1 text-[var(--foreground)]/60">No announcements yet.</p>
                  ) : (
                    <ul className="mt-1 flex flex-col gap-1">
                      {classroomAnnouncements[i].map((a) => (
                        <li key={a.id}>{a.body}</li>
                      ))}
                    </ul>
                  )}
                  <AnnouncementForm classroomId={classroom.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <CreateClassroomForm />
      </section>
    </main>
  );
}
