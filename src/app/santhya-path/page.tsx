import Link from "next/link";
import { getStages } from "@/lib/santhya-path";

// Server-rendered on demand — queries live D1, which isn't reachable at build
// time (no Workers bindings outside the deployed runtime).
export const dynamic = "force-dynamic";

export default async function SanthyaPathPage() {
  const stages = await getStages();

  return (
    <main className="mx-auto max-w-3xl flex-1 p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        Sikhi &middot; Punjabi
      </p>
      <h1 className="mt-1 text-3xl font-bold">Santhya Path</h1>
      <p className="mt-3 text-[var(--foreground)]/70">
        A stage-by-stage path to reading Gurbani — from the Gurmukhi alphabet through Sri Guru
        Granth Sahib Ji, Sri Dasam Granth, and Sri Sarbloh Granth. Go at your own pace; the
        recommended order below is guidance, not a gate.
      </p>

      <ol className="mt-8 flex flex-col gap-4">
        {stages.map((stage) => {
          const trackCount = stage.section?.audioTracks?.length ?? 0;
          const ready = trackCount > 0;
          return (
            <li key={stage.id}>
              <Link
                href={`/santhya-path/${stage.slug}`}
                className="block rounded-lg border border-[var(--foreground)]/15 p-5 transition hover:border-[var(--color-saffron)]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-semibold">
                    Stage {stage.order} &middot; {stage.title}
                  </h2>
                  <span className="shrink-0 text-xs text-[var(--foreground)]/50">
                    {ready ? `${trackCount} audio tracks` : "reader coming soon"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--foreground)]/70">{stage.description}</p>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
