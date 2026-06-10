import type Lenis from "lenis";

/**
 * Module-level handle to the Lenis instance created by <SmoothScroll>,
 * so navigation anywhere in the tree can drive smooth anchor scrolling.
 */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: -16, duration: 1.2 });
  } else {
    target.scrollIntoView({ behavior: "auto" });
  }
}
