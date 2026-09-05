import { Fragment } from "react";
import WordLookup from "@/components/dictionary/WordLookup";

interface ContentBlock {
  type: string;
  ref?: string;
  text?: string;
  src?: string;
  caption?: string;
}

// Authoring convention for the dictionary lookup affordance (plan §5 D4):
// `[[word]]` in a block's text marks that word as lookup-able. Capturing group
// means String.split hands back plain segments at even indices and marked words
// at odd ones. See docs/CONTENT-AUTHORING.md.
const LOOKUP_MARKUP = /\[\[([^[\]]+)\]\]/;

function renderText(text: string, language?: string) {
  const segments = text.split(LOOKUP_MARKUP);
  if (segments.length === 1) return text;

  return segments.map((segment, i) =>
    // No language means we can't say which dictionary to query, so the markup
    // degrades to its own contents rather than leaking brackets into a child's
    // reading passage — content authored before (or outside) this convention
    // must never render worse because the convention exists.
    i % 2 === 1 && language ? (
      <WordLookup key={i} word={segment} language={language} />
    ) : (
      <Fragment key={i}>{segment}</Fragment>
    ),
  );
}

// Renders one lesson content block. Most existing content is plain text;
// image/video blocks (src = a real image URL or YouTube video ID) are
// supported for lessons authored with real media going forward.
export default function LessonContentBlock({ block, language }: { block: ContentBlock; language?: string }) {
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

  return <p className="leading-relaxed opacity-90">{block.text ? renderText(block.text, language) : null}</p>;
}
