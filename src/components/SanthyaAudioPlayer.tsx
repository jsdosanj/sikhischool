"use client";

import { useMemo, useState } from "react";

interface Track {
  title: string;
  sourceUrl: string;
  r2Key: string;
}

// Audio currently streams from sourceUrl (gurmatveechar.com, mirrored by sikh-archive
// into their own R2 under r2Key) — copying these into sikhischool-media is separate,
// not-yet-done work (see scripts/migrate-santhya-path.ts).
export default function SanthyaAudioPlayer({ tracks }: { tracks: Track[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return tracks;
    const q = query.toLowerCase();
    return tracks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tracks, query]);

  const current = tracks[selected];

  return (
    <div className="mt-6 rounded-lg border border-[var(--foreground)]/15">
      <div className="border-b border-[var(--foreground)]/15 p-4">
        <audio key={current?.sourceUrl} controls preload="none" className="w-full" src={current?.sourceUrl}>
          <track kind="captions" />
        </audio>
        <p className="mt-2 text-sm font-medium">{current?.title}</p>
      </div>
      <div className="p-3">
        <label className="sr-only" htmlFor="track-search">
          Search tracks
        </label>
        <input
          id="track-search"
          type="search"
          placeholder={`Search ${tracks.length} tracks…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded border border-[var(--foreground)]/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--color-saffron)]"
        />
        <ul className="mt-2 max-h-72 overflow-y-auto">
          {filtered.map((track) => {
            const index = tracks.indexOf(track);
            return (
              <li key={track.sourceUrl}>
                <button
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`block w-full rounded px-2 py-1.5 text-left text-sm transition ${
                    index === selected
                      ? "bg-[var(--color-saffron)]/15 font-medium"
                      : "hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  {track.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
