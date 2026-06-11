import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/profile";

// Runs before first paint: stored choice → OS preference → dark. Kept here
// (not in lib/theme.ts) because that module is client-only.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0F" },
    { media: "(prefers-color-scheme: light)", color: "#F7F7FB" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before first paint: stored choice → OS preference → dark. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[110] rounded-md bg-accent px-4 py-2 font-medium text-onaccent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
