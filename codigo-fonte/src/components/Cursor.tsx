'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/** Minimal cursor: precise dot + lagging ring that reacts to interactive targets. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.documentElement.classList.add('has-cursor');
    ring.current!.dataset.state = 'out';
    dot.current!.style.opacity = '0';
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });
    const move = (e: PointerEvent) => {
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY);
      dot.current!.style.opacity = '1';
      const t = e.target as HTMLElement;
      const drag = t.closest?.('[data-cursor="drag"]');
      const hot = t.closest?.('a, button, [role="button"], input, label');
      ring.current!.dataset.state = drag ? 'drag' : hot ? 'hot' : '';
    };
    const leave = () => ring.current && (ring.current.dataset.state = 'out');
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);
  return (
    <>
      <div className="cur-dot" ref={dot} aria-hidden />
      <div className="cur-ring" ref={ring} aria-hidden>
        <span>Arraste</span>
      </div>
    </>
  );
}
