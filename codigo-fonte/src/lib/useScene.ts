'use client';
import { useLayoutEffect, type RefObject } from 'react';
import { gsap, prefersReducedMotion } from './gsap';

/**
 * Scoped GSAP setup for a section. Everything created inside `build`
 * (tweens, ScrollTriggers) is reverted on unmount.
 */
export function useScene(ref: RefObject<HTMLElement | null>, build: (ctx: { reduced: boolean; q: (s: string) => Element[] }) => void | (() => void)) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      const q = (s: string) => gsap.utils.toArray<Element>(s, ref.current!);
      cleanup = build({ reduced: prefersReducedMotion(), q });
    }, ref);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
