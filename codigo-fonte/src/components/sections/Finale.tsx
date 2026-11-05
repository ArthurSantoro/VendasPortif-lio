'use client';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { TAU } from '@/lib/poses';
import { scrollToId } from '@/lib/scroll';
import { Chars } from '@/lib/split';
import { registerSegment } from '@/lib/stage';
import { useScene } from '@/lib/useScene';
import { productPose } from './Product';

export default function Finale() {
  const ref = useRef<HTMLElement>(null);
  useScene(ref, ({ reduced }) => {
    const center = (v: { mobile: boolean }) => ({ x: 0, y: v.mobile ? 0.02 : 0.0, s: v.mobile ? 0.8 : 0.38, rx: 0.16, ry: -TAU - 0.55, rz: 0.04, rim: 1, shadow: 0.8 });
    const unreg = registerSegment(ref.current!, 'top bottom', 'bottom bottom', [
      { t: 0, pose: productPose },
      { t: 0.36, pose: center },
      { t: 0.6, pose: (v) => ({ ...center(v), ry: -TAU + 0.35, rx: 0.24, s: v.mobile ? 0.86 : 0.42 }) },
      { t: 0.66, pose: (v) => ({ ...center(v), ry: -TAU + 0.15, rz: -0.12, y: -0.06, s: v.mobile ? 0.86 : 0.42, shadow: 1 }) },
      { t: 0.76, pose: (v) => ({ ...center(v), ry: -TAU + 0.1, rz: 0.7, rx: -0.4, y: 0.95, z: 1.4, s: 0.5, shadow: 0 }) },
      { t: 0.8, pose: (v) => ({ ...center(v), ry: -TAU, rz: 0.8, y: 1.1, z: 1.6, vis: 0, shadow: 0 }) },
      { t: 1, pose: { vis: 0, y: 1.1 } },
    ], 8);
    if (reduced) return unreg;
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: true } });
    tl.fromTo('.fi-cone', { opacity: 0, scaleX: 0.3 }, { opacity: 1, scaleX: 1, duration: 0.15 }, 0)
      .fromTo('.fi-l1 .ch', { yPercent: 100, rotateX: -95, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, stagger: 0.012, duration: 0.14 }, 0.06)
      .fromTo('.fi-l2 .ch', { yPercent: 100, rotateX: -95, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, stagger: 0.012, duration: 0.14 }, 0.18)
      .fromTo('.fi-title', { scale: 1.12, letterSpacing: '0.04em' }, { scale: 1, letterSpacing: '-0.02em', duration: 0.5 }, 0.06)
      // the shoe doesn't wait — it launches out of frame
      .fromTo('.fi-streak', { scaleY: 0, opacity: 1 }, { scaleY: 1, duration: 0.08, ease: 'power2.in' }, 0.5)
      .to('.fi-streak', { opacity: 0, duration: 0.06 }, 0.6)
      .to('.fi-cone', { opacity: 0.25, duration: 0.1 }, 0.55)
      .fromTo('.fi-title', { y: 0 }, { y: () => (window.innerWidth < 820 ? -40 : -70), duration: 0.25 }, 0.58)
      .fromTo('.fi-under', { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: 'power2.out' }, 0.64)
      .fromTo('.fi-cta > *', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.1 }, 0.72);
    return unreg;
  });

  return (
    <section id="futuro" className="finale" ref={ref} aria-labelledby="finale-title">
      <div className="pin">
        <div className="fi-cone" aria-hidden />
        <div className="fi-streak" aria-hidden />
        <h2 className="fi-title" id="finale-title" aria-label="The future doesn't wait.">
          <span className="fi-l1"><Chars text="THE FUTURE" /></span>
          <span className="fi-l2"><Chars text="DOESN'T WAIT." /></span>
          <span className="fi-under" aria-hidden />
        </h2>
        <div className="fi-cta">
          <p>VELOCITY X1. Disponível agora em três cores.</p>
          <button className="btn btn-primary" onClick={() => scrollToId('comprar')}>
            <span>Garantir o meu</span>
          </button>
        </div>
      </div>
    </section>
  );
}
