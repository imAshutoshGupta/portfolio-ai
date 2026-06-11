import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/profile";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif",
  display: "swap",
});

// Explicit URL wins; otherwise Vercel's auto-injected deployment URL keeps
// OG/Twitter previews correct on zero-config preview deploys.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const title = `${profile.name} — ${profile.role}`;
const description = `${profile.tagline} Based in ${profile.location}. Explore selected work or ask the built-in AI assistant anything about ${profile.firstName}'s skills and experience.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    profile.name,
    profile.role,
    "portfolio",
    "web developer",
    "TypeScript",
    "React",
    "Next.js",
  ],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: profile.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@im_AshutoshG",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only z-[110] rounded-md bg-accent px-4 py-2 font-medium text-base focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
