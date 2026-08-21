interface ContentBlock {
  type: string;
  ref?: string;
  text?: string;
  src?: string;
  caption?: string;
}

// Renders one lesson content block. Most existing content is plain text;
// image/video blocks (src = a real image URL or YouTube video ID) are
// supported for lessons authored with real media going forward.
export default function LessonContentBlock({ block }: { block: ContentBlock }) {
  if (block.type === "image" && block.src) {
    return (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- external, non-local image source */}
        <img src={block.src} alt={block.caption ?? ""} className="w-full rounded-lg object-cover" style={{ borderRadius: "var(--shell-radius, 0.5rem)" }} />
        {block.caption && <figcaption className="mt-1 text-xs opacity-50">{block.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "video" && block.src) {
    return (
      <div className="overflow-hidden" style={{ borderRadius: "var(--shell-radius, 0.5rem)" }}>
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${block.src}`}
            title={block.caption ?? "Lesson video"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return <p className="leading-relaxed opacity-90">{block.text}</p>;
}
