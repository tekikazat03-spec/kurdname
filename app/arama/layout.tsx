import type { Metadata } from "next";

export const metadata: Metadata = { title: "Arama", robots: { index: false, follow: true } };

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
