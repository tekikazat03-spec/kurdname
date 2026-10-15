import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kurdnamehistory.com"),
  title: {
    default: "KURDNAME | Kürdistan Tarihi ve Dijital Arşivi",
    template: "%s | KURDNAME",
  },
  description:
    "KURDNAME, Kürdistan tarihi, Kürt şahsiyetleri, edebiyatı, tarihî olaylar, örgütler ve belgeler üzerine kaynaklı biyografiler ve arşiv kayıtları sunan bağımsız dijital tarih arşividir.",
  applicationName: "KURDNAME",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "KURDNAME",
    title: "KURDNAME | Kürdistan Tarihi ve Dijital Arşivi",
    description:
      "Kürdistan tarihini, şahsiyetlerini, eserlerini ve tarihî belgelerini keşfedin.",
    url: "https://www.kurdnamehistory.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
