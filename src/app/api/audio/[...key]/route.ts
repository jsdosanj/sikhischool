import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serves Santhya Path audio from our own R2 mirror (sikhischool-media) when a
// track has been copied there — see scripts/copy-santhya-audio.ts, the R2-to-R2
// copy the plan flagged as separate, real work from the Wave 1a data migration.
// Falls back to a redirect to the original ?src= (gurmatveechar.com, via
// sourceUrl) for tracks not yet copied, so playback never breaks mid-migration —
// SanthyaAudioPlayer always points at this route, never sourceUrl directly.
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");

  const { env } = await getCloudflareContext({ async: true });

  // Some of these files are 40MB+ multi-hour recordings — real Range support
  // (not just a 200 that ignores the header) is what lets the <audio> element
  // seek instead of re-downloading the whole file. R2 parses the standard Range
  // header itself when handed the request's Headers directly.
  const hasRange = request.headers.has("range");
  const object = await env.MEDIA.get(key, hasRange ? { range: request.headers } : undefined);

  if (object) {
    const contentType = object.httpMetadata?.contentType ?? "audio/mpeg";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (object.range && "length" in object.range && object.range.length !== undefined) {
      const offset = object.range.offset ?? 0;
      const length = object.range.length;
      headers["Content-Range"] = `bytes ${offset}-${offset + length - 1}/${object.size}`;
      headers["Content-Length"] = String(length);
      return new Response(object.body, { status: 206, headers });
    }
    headers["Content-Length"] = String(object.size);
    return new Response(object.body, { headers });
  }

  const fallback = new URL(request.url).searchParams.get("src");
  if (!fallback) {
    return new Response("Not found", { status: 404 });
  }
  return Response.redirect(fallback, 302);
}
