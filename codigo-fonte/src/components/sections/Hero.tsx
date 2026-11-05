'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { HERO, HERO_END, HERO_MID } from '@/lib/poses';
import { Chars } from '@/lib/split';
import { registerSegment } from '@/lib/stage';
import { useStore } from '@/lib/store';
import { useScene } from '@/lib/useScene';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const ready = useStore((s) => s.ready);

  useScene(ref, ({ reduced, q }) => {
    const unreg = registerSegment(ref.current!, 'top top', 'bottom bottom', [
      { t: 0, pose: HERO },
      { t: 0.5, pose: HERO_MID },
      { t: 0.82, pose: HERO_END },
      { t: 1, pose: HERO_END },
    ], 1);
    if (reduced) return unreg;
    gsap.set(q('.hero-title .ch'), { yPercent: 115 });
    gsap.set(q('.hero-reveal'), { autoAlpha: 0, y: 24 });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: true } });
    // the headline tears apart: lines drift outward, letters scatter in depth
    tl.to('.hero-l1', { xPercent: -38, duration: 0.55 }, 0)
      .to('.hero-l2', { xPercent: 38, duration: 0.55 }, 0)
      .to('.hero-title', { letterSpacing: '0.06em', opacity: 0, filter: 'blur(14px)', duration: 0.45 }, 0.08)
      .to('.hero-title .ch', { y: (i) => (i % 2 ? -1 : 1) * (40 + (i * 37) % 120), rotate: (i) => ((i * 53) % 30) - 15, duration: 0.5, stagger: 0.004 }, 0)
      .to('.hero-ui', { autoAlpha: 0, y: -30, duration: 0.18 }, 0)
      .to('.hero-spot', { scale: 2.4, opacity: 0.0, duration: 0.6 }, 0)
      .to('.hero-floor', { yPercent: 40, opacity: 0, duration: 0.5 }, 0)
      .fromTo('.hero-speed i', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, stagger: 0.01, duration: 0.25 }, 0.3)
      .to('.hero-speed', { opacity: 0, duration: 0.1 }, 0.62)
      // the camera passes through the toe: the world flips to ice white
      .fromTo('.hero-flash', { clipPath: 'circle(0% at 50% 52%)' }, { clipPath: 'circle(75% at 50% 52%)', duration: 0.22, ease: 'power2.in' }, 0.62);
    return unreg;
  });

  useEffect(() => {
    if (!ready || !ref.current) return;
    const el = ref.current;
    const tl = gsap.timeline({ delay: 0.55 });
    tl.to(el.querySelectorAll('.hero-title .ch'), { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: { each: 0.035, from: 'start' } })
      .to(el.querySelectorAll('.hero-reveal'), { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, '-=1.0')
      .fromTo(el.querySelector('.hero-spot i'), { opacity: 0 }, { opacity: 1, duration: 2, ease: 'power2.out' }, 0);
    return () => void tl.kill();
  }, [ready]);

  return (
    <section id="hero" className="hero" ref={ref} aria-label="VELOCITY X1 — Designed to outrun">
      <div className="pin">
        <div className="hero-spot"><i /></div>
        <div className="hero-floor" />
        <h1 className="hero-title" aria-label="Designed to outrun.">
          <span className="hero-l1"><Chars text="DESIGNED" /></span>
          <span className="hero-l2"><Chars text="TO OUTRUN." /></span>
        </h1>
        <div className="hero-speed" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <i key={i} style={{ top: `${8 + ((i * 41) % 84)}%`, left: `${(i * 23) % 60}%`, width: `${20 + ((i * 17) % 40)}%` }} />
          ))}
        </div>
        <div className="hero-ui">
        <div className="hero-meta hero-reveal">
          <span className="mono">VELOCITY X1</span>
          <span className="mono dim">Road racing — SS26</span>
        </div>
        <div className="hero-side hero-reveal mono" aria-hidden>
          <span>212 G</span>
          <span>8 MM DROP</span>
          <span>CARBON PLATE</span>
        </div>
        <p className="hero-sub hero-reveal">
          Placa de carbono, espuma reativa e 212 gramas de pura intenção. <em>Construído para o último quilômetro.</em>
        </p>
        <div className="hero-scroll hero-reveal" aria-hidden>
          <span className="mono">Role para acelerar</span>
          <span className="hero-scroll-line" />
        </div>
        </div>
        <picture className="fallback hero-fallback">
          <img src="images/g-hero.webp" alt="VELOCITY X1 em estúdio com iluminação dramática" />
        </picture>
        <div className="hero-flash" />
      </div>
    </section>
  );
}
