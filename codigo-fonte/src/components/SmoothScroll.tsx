'use client';
import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { scroller } from '@/lib/scroll';
import { useStore } from '@/lib/store';

export default function SmoothScroll() {
  const ready = useStore((s) => s.ready);
  const cartOpen = useStore((s) => s.cartOpen);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    if (prefersReducedMotion()) {
      document.documentElement.classList.add('reduced');
      return;
    }
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    scroller.lenis = lenis;
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      scroller.lenis = null;
    };
  }, []);

  useEffect(() => {
    const l = scroller.lenis;
    document.documentElement.classList.toggle('locked', !ready || cartOpen);
    if (!l) return;
    if (!ready || cartOpen) l.stop();
    else l.start();
  }, [ready, cartOpen]);

  useEffect(() => {
    if (!ready) return;
    const r = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(r);
    const id = setTimeout(r, 400);
    return () => clearTimeout(id);
  }, [ready]);
  return null;
}
