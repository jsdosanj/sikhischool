"use client";

import { useMemo, useState } from "react";

interface Track {
  title: string;
  sourceUrl: string;
  r2Key: string;
}

// Every track streams through /api/audio/[...key], which serves our own R2 mirror
// (sikhischool-media) when a track has been copied there and falls back to the
// original sourceUrl (gurmatveechar.com) otherwise — see that route and
// scripts/copy-santhya-audio.ts. r2Key, not sourceUrl, is the stable per-track
// identity: some tracks (e.g. every SGGS ang) carry an empty sourceUrl.
function audioSrc(track: Track): string {
  const path = track.r2Key.split("/").map(encodeURIComponent).join("/");
  const params = track.sourceUrl ? `?src=${encodeURIComponent(track.sourceUrl)}` : "";
  return `/api/audio/${path}${params}`;
}

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
        <audio key={current?.r2Key} controls preload="none" className="w-full" src={current ? audioSrc(current) : undefined}>
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
              <li key={track.r2Key}>
                <button
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`block w-full rounded px-2 py-1.5 text-start text-sm transition ${
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
