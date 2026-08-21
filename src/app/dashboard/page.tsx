import { redirect } from "next/navigation";
import { getCurrentParent, getChildren } from "@/lib/session";
import AddChildForm from "./AddChildForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const parent = await getCurrentParent();
  if (!parent) redirect("/login");

  const children = await getChildren(parent.id);

  return (
    <main className="mx-auto max-w-2xl flex-1 p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        Parent dashboard
      </p>
      <h1 className="mt-1 text-2xl font-bold">{parent.email}</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Children</h2>
        {children.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--foreground)]/70">
            No children added yet — add one below to start tracking their progress.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {children.map((child) => (
              <li
                key={child.id}
                className="rounded-lg border border-[var(--foreground)]/15 p-3 text-sm"
              >
                <span className="font-medium">{child.displayName}</span>{" "}
                <span className="text-[var(--foreground)]/60">
                  &middot; {child.gradeLevel === "K" ? "Kindergarten" : `Grade ${child.gradeLevel}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <AddChildForm />
      </section>
    </main>
  );
}
