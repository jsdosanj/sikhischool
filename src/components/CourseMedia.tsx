// Renders a course's real hero image (with required attribution, when the
// license calls for it) and an embedded intro video. Both fields are
// optional on the course row — older/not-yet-seeded courses simply render
// nothing here rather than a broken placeholder.
export default function CourseMedia({
  heroImageUrl,
  heroImageAttribution,
  videoId,
  title,
}: {
  heroImageUrl: string | null;
  heroImageAttribution: string | null;
  videoId: string | null;
  title: string;
}) {
  if (!heroImageUrl && !videoId) return null;

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row">
      {heroImageUrl && (
        <figure className="flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- external Wikimedia Commons URL, not a local/optimizable asset */}
          <img
            src={heroImageUrl}
            alt={title}
            className="w-full rounded-lg object-cover"
            style={{ borderRadius: "var(--shell-radius, 0.5rem)", maxHeight: "260px" }}
          />
          {heroImageAttribution && (
            <figcaption className="mt-1 text-xs opacity-50">{heroImageAttribution}</figcaption>
          )}
        </figure>
      )}
      {videoId && (
        <div className="flex-1 overflow-hidden" style={{ borderRadius: "var(--shell-radius, 0.5rem)" }}>
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={`${title} — intro video`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
