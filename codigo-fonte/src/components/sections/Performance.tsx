'use client';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { TECH_EXIT, TAU } from '@/lib/poses';
import { Line } from '@/lib/split';
import { registerSegment, type Viewport } from '@/lib/stage';
import { useScene } from '@/lib/useScene';

const FRAMES = [
  { img: 'env-track', k: 'Pista — Raia 04', h: ['Cada passada,', 'uma decisão.'], stat: '87%', sl: 'retorno de energia' },
  { img: 'env-city', k: 'Cidade — 05:40', h: ['A noite é sua', 'linha de chegada.'], stat: '212 g', sl: 'tamanho 40 BR' },
  { img: 'env-tunnel', k: 'Treino — km 32', h: ['O último quilômetro', 'decide tudo.'], stat: '4:05', sl: 'min / km no ritmo de prova' },
];

// The shoe sprints across the frame while the world changes around it.
const run = (v: Viewport, t: number) => ({
  ...TECH_EXIT(v),
  y: v.mobile ? 0.04 : -0.02,
  rz: 0.1 + Math.sin(t * Math.PI * 9) * 0.1,
  rx: 0.1 + Math.sin(t * Math.PI * 9 + 1) * 0.05,
  ry: -TAU - 0.12,
  rim: 1,
});

export default function Performance() {
  const ref = useRef<HTMLElement>(null);
  const km = useRef<HTMLSpanElement>(null);
  const pace = useRef<HTMLSpanElement>(null);

  useScene(ref, ({ reduced, q }) => {
    const unreg = registerSegment(ref.current!, 'top bottom', 'bottom bottom', [
      { t: 0, pose: TECH_EXIT },
      { t: 0.2, pose: (v, t) => ({ ...run(v, t), x: -0.82 }) },
      { t: 0.92, pose: (v, t) => ({ ...run(v, t), x: v.mobile ? 0.8 : 0.78 }) },
      { t: 1, pose: (v, t) => ({ ...run(v, t), x: 0.9, vis: 0 }) },
    ], 4);
    if (reduced) return unreg;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (s) => {
          if (km.current) km.current.textContent = (s.progress * 42.195).toFixed(2).padStart(5, '0');
          if (pace.current) pace.current.textContent = `${3 + Math.floor((1 - s.progress) * 1.6)}:${String(Math.floor(((1 - s.progress) * 97) % 60)).padStart(2, '0')}`;
        },
      },
    });
    const [f1, f2, f3] = q('.pf-frame');
    const texts = q('.pf-text');
    // 1 — a small window explodes to the full viewport
    tl.fromTo(f1, { clipPath: 'inset(37% 39% 37% 39% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.17, ease: 'power2.inOut' }, 0)
      .fromTo(f1.querySelector('img'), { scale: 1.7 }, { scale: 1.08, duration: 0.2 }, 0)
      .to(f1.querySelector('img'), { scale: 1.3, duration: 0.25 }, 0.2)
      .fromTo('.pf-hud', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.12)
      // 2 — a slanted brand slash wipes in the city
      .fromTo(f2, { clipPath: 'polygon(100% 0%, 112% 0%, 100% 100%, 88% 100%)' }, { clipPath: 'polygon(-25% 0%, 112% 0%, 100% 100%, -37% 100%)', duration: 0.13, ease: 'power2.inOut' }, 0.34)
      .fromTo('.pf-slash', { xPercent: 0 }, { xPercent: -980, duration: 0.13, ease: 'power2.inOut' }, 0.34)
      .fromTo(f2.querySelector('img'), { scale: 1.35, xPercent: 6 }, { scale: 1.05, xPercent: 0, duration: 0.34 }, 0.34)
      // 3 — the word becomes the window: LIMITLESS scales until it is the image
      .fromTo('.pf-mask', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.6)
      .set(f3, { autoAlpha: 1 }, 0.6)
      .fromTo('.pf-mask-word', { scale: 0.9 }, { scale: 1, duration: 0.04 }, 0.6)
      .to('.pf-mask-word', { scale: 70, duration: 0.15, ease: 'power3.in' }, 0.66)
      .set('.pf-mask', { autoAlpha: 0 }, 0.81)
      .fromTo(f3.querySelector('img'), { scale: 1.3 }, { scale: 1.0, duration: 0.2 }, 0.66)
      // speed lines run the whole sequence
      .fromTo('.pf-lines i', { xPercent: 120 }, { xPercent: (i) => -220 - (i % 4) * 60, duration: 0.88 }, 0.08)
      .to('.pf-hud', { autoAlpha: 0, duration: 0.04 }, 0.88)
      // hand-off: ice panel rises into the gallery
      .fromTo('.pf-outro', { clipPath: 'inset(100% 0% 0% 0% round 40vw 40vw 0 0)' }, { clipPath: 'inset(0% 0% 0% 0% round 0vw 0vw 0 0)', duration: 0.1, ease: 'power2.in' }, 0.9);
    const at = [[0.1, 0.32], [0.44, 0.58], [0.8, 0.9]];
    texts.forEach((t, i) => {
      tl.fromTo(t.querySelectorAll('.line-inner'), { yPercent: 110 }, { yPercent: 0, stagger: 0.01, duration: 0.06, ease: 'power3.out' }, at[i][0])
        .fromTo(t.querySelector('.pf-stat'), { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.06 }, at[i][0] + 0.02)
        .to(t.querySelectorAll('.line-inner'), { yPercent: -110, stagger: 0.01, duration: 0.05, ease: 'power3.in' }, at[i][1])
        .to(t.querySelector('.pf-stat'), { autoAlpha: 0, x: -60, duration: 0.05 }, at[i][1]);
    });
    return unreg;
  });

  return (
    <section id="performance" className="perf" ref={ref} aria-labelledby="perf-title">
      <h2 id="perf-title" className="sr-only">Experiência e performance</h2>
      <div className="pin">
        {FRAMES.map((f, i) => (
          <div className={`pf-frame f${i + 1}`} key={f.img}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`images/${f.img}.webp`} srcSet={`images/${f.img}-sm.webp 1000w, images/${f.img}.webp 2400w`} sizes="100vw" alt="" loading="lazy" />
          </div>
        ))}
        <div className="pf-slash" aria-hidden />
        <div className="pf-mask" aria-hidden>
          <span className="pf-mask-word">L<b>I</b>MITLESS</span>
        </div>
        <div className="pf-lines" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <i key={i} style={{ top: `${6 + ((i * 37) % 88)}%`, width: `${18 + ((i * 29) % 30)}vw`, opacity: 0.25 + (i % 3) * 0.2 }} />
          ))}
        </div>
        {FRAMES.map((f, i) => (
          <div className={`pf-text t${i + 1}`} key={f.k}>
            <span className="kicker"><Line>{`04.${i + 1} — ${f.k}`}</Line></span>
            <h3>
              <Line>{f.h[0]}</Line>
              <Line>{f.h[1]}</Line>
            </h3>
            <div className="pf-stat">
              <strong>{f.stat}</strong>
              <span className="mono">{f.sl}</span>
            </div>
          </div>
        ))}
        <div className="pf-hud mono" aria-hidden>
          <div><em>Distância</em><span ref={km}>00.00</span> km</div>
          <div><em>Ritmo</em><span ref={pace}>4:37</span> /km</div>
          <div className="pf-hud-bar"><i /></div>
        </div>
        <div className="pf-outro" aria-hidden />
      </div>
    </section>
  );
}
