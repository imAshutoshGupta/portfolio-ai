"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

/**
 * Theme state lives on <html data-theme="...">, set pre-paint by the inline
 * script in app/layout.tsx (persisted choice → prefers-color-scheme → dark).
 * This hook mirrors that attribute reactively so components (e.g. the 3D
 * hero's lighting) can respond to toggles.
 */
export function useTheme(): Theme {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const el = document.documentElement;
    const read = () => setThemeState(el.dataset.theme === "light" ? "light" : "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/** Applies + persists a theme, with a brief CSS crossfade. */
export function applyTheme(theme: Theme) {
  const el = document.documentElement;
  el.classList.add("theme-switching");
  el.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Storage unavailable (private mode) — the choice just won't persist.
  }
  window.setTimeout(() => el.classList.remove("theme-switching"), 400);
}
