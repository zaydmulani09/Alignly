import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The workspace holds session-only state and has nothing to index.
      disallow: "/api/",
    },
  };
}
