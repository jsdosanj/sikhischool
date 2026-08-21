import Link from "next/link";
import { notFound } from "next/navigation";
import { getStageBySlug } from "@/lib/santhya-path";
import SanthyaAudioPlayer from "@/components/SanthyaAudioPlayer";

// Server-rendered on demand, not statically generated — the stage list comes from
// live D1, which isn't reachable at build time (no Workers bindings outside the
// deployed runtime).
export const dynamic = "force-dynamic";

export default async function SanthyaStagePage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const { stage: slug } = await params;
  const stage = await getStageBySlug(slug);
  if (!stage) notFound();

  const section = stage.section;
  const tracks = section?.audioTracks ?? [];
  const externalReader = section?.externalReader;

  return (
    <main className="mx-auto max-w-3xl flex-1 p-8">
      <Link href="/santhya-path" className="text-sm text-[var(--foreground)]/60 hover:underline">
        &larr; Santhya Path
      </Link>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-saffron)]">
        Stage {stage.order} of 7
      </p>
      <h1 className="mt-1 text-3xl font-bold">{stage.title}</h1>
      {section?.gurmukhiTitle && (
        <p lang="pa" className="mt-1 text-lg">
          {section.gurmukhiTitle}
        </p>
      )}
      <p className="mt-4 text-[var(--foreground)]/70">{stage.description}</p>

      {externalReader && (
        <Link
          href={externalReader.href}
          className="mt-6 inline-block rounded bg-[var(--color-saffron)] px-4 py-2 text-sm font-semibold text-[#2a1c06] hover:brightness-105"
        >
          {externalReader.label} &rarr;
        </Link>
      )}

      {tracks.length > 0 ? (
        <SanthyaAudioPlayer tracks={tracks} />
      ) : (
        <p className="mt-6 rounded-lg border border-[var(--foreground)]/15 p-5 text-sm text-[var(--foreground)]/70">
          The interactive reader for this stage is still being built. Check back soon.
        </p>
      )}

      {section?.audioNote && (
        <p className="mt-3 text-xs text-[var(--foreground)]/50">Audio: {section.audioNote}</p>
      )}
    </main>
  );
}
