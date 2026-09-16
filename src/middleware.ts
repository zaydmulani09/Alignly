import { NextResponse, type NextRequest } from "next/server";

/**
 * Nonce-based Content Security Policy.
 *
 * A CSP without a `script-src` falls back to `default-src`, which blocks every
 * inline script — including the framework's own bootstrap and the pre-paint
 * theme script. So the policy issues a fresh nonce per request, hands it to the
 * framework through the `x-nonce` request header (the root layout reads it for
 * the theme script), and uses 'strict-dynamic' so scripts loaded by trusted
 * scripts are allowed without listing every chunk.
 *
 * Development additionally needs 'unsafe-eval', which the bundler relies on for
 * hot reloading. Production gets the strict policy.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind and next/font both emit inline style tags.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    // Gemini is called from the server, so the browser only talks to this origin.
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Every page request, but not static assets or the icon, which need no policy.
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
