import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/arama"] }],
    sitemap: "https://www.kurdnamehistory.com/sitemap.xml",
    host: "https://www.kurdnamehistory.com",
  };
}
