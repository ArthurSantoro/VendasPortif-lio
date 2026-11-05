'use client';
import type Lenis from 'lenis';
/** Shared handle to the Lenis instance (null when reduced motion is on). */
export const scroller: { lenis: Lenis | null } = { lenis: null };
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (scroller.lenis) scroller.lenis.scrollTo(el, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: 'auto' });
}
