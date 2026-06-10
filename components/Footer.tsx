"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

/** Live clock in the developer's timezone — the footer's small signature detail. */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Rendered client-side only to avoid a hydration mismatch.
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time ?? "··:··:··"}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="footer-shimmer h-px w-full" aria-hidden="true" />
      <div className="mx-auto flex max-w-site flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:px-10">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
          {profile.location} · <LocalTime />
        </p>
        <p>Next.js · Three.js · GSAP</p>
      </div>
    </footer>
  );
}
