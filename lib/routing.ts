export const CANONICAL_ORIGIN = "https://ztd.me";
export const REDIRECT_HOSTS = ["doa.ink", "zeithrold.dev", "www.zeithrold.dev", "ztd.one"] as const;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Runs before the app AND static assets. Only exact, approved hosts match. */
export function routeRequest(request: Request): Response | null {
  const url = new URL(request.url);
  const canonical = url.hostname === "ztd.me";
  const alias = REDIRECT_HOSTS.some((host) => host === url.hostname);

  if (alias || (canonical && (url.protocol !== "https:" || url.port !== ""))) {
    // Assign fields on a fixed origin. A path beginning with // can never change the host.
    const target = new URL(CANONICAL_ORIGIN);
    target.pathname = url.pathname;
    target.search = url.search;
    return new Response(null, {
      status: 308,
      headers: { Location: target.href, "Cache-Control": "no-store" },
    });
  }

  if (!canonical && !LOCAL_HOSTS.has(url.hostname)) {
    return new Response("Misdirected Request", {
      status: 421,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return null;
}
