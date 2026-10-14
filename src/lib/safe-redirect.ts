// The audio route falls back to a redirect to the original recording. That target comes from the query string, so it
// must be pinned to the known source host; otherwise the route is an open redirect usable for phishing links that
// start on punjabiuni's own domain.
const ALLOWED_HOSTS = ["gurmatveechar.com"];

/** The URL if it is https on an allowed host (or a subdomain of one), else null. */
export function safeAudioFallback(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith("." + h)) ? url.toString() : null;
  } catch {
    return null;
  }
}
