import type { NextConfig } from "next";

/**
 * Response headers.
 *
 * `script-src` is deliberately absent: Next.js injects inline bootstrap scripts
 * (and uses eval in development), so a meaningful script policy needs
 * nonce-based CSP wired through middleware. The directives here are the ones
 * that can be set without weakening themselves to 'unsafe-inline' — they stop
 * this app being framed, stop plugin content, and pin where forms and requests
 * can go. See the README's limitations section.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // No feature of this app needs any of these.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline'",
      // Gemini is called server-side, so the browser only ever talks to us.
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Nothing an API route returns should be cached anywhere.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
