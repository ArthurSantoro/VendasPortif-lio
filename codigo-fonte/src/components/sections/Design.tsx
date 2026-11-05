'use client';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { DESIGN_IN, HERO_END, TECH_START, TAU } from '@/lib/poses';
import { Line } from '@/lib/split';
import { registerSegment } from '@/lib/stage';
import { useScene } from '@/lib/useScene';

const CARDS = [
  { cls: 'c1', img: 'd-toe', n: '01', t: 'Biqueira esculpida', d: 'Geometria de rolagem que antecipa a próxima passada.' },
  { cls: 'c2', img: 'd-tab', n: '02', t: 'Contraforte de calcanhar', d: 'Estrutura moldada a 3 mm: trava sem pressionar.' },
  { cls: 'c3', img: 'd-stripe', n: '03', t: 'Assinatura //', d: 'Faixas termocoladas que travam o mediopé em curva.' },
];

export default function Design() {
  const ref = useRef<HTMLElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const deg = useRef<HTMLSpanElement>(null);

  useScene(ref, ({ reduced, q }) => {
    const unreg = registerSegment(ref.current!, 'top bottom', 'bottom bottom', [
      { t: 0, pose: HERO_END },
      { t: 0.22, pose: DESIGN_IN },
      { t: 0.42, pose: (v) => ({ ...DESIGN_IN(v), ry: -3.35, rx: 0.52, y: 0.0, s: v.mobile ? 0.76 : 0.38 }) },
      { t: 0.61, pose: (v) => ({ ...DESIGN_IN(v), ry: -4.7, rx: 0.06, x: v.mobile ? 0 : 0.05, s: v.mobile ? 0.8 : 0.4 }) },
      { t: 0.8, pose: (v) => ({ ...DESIGN_IN(v), ry: -5.85, rx: 0.2, x: v.mobile ? 0 : -0.04, s: v.mobile ? 0.8 : 0.41 }) },
      { t: 0.94, pose: TECH_START },
      { t: 1, pose: TECH_START },
    ], 2);
    if (reduced) return unreg;
    const f = front.current!;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (s) => deg.current && (deg.current.textContent = String(Math.round(s.progress * 360)).padStart(3, '0')),
      },
    });
    tl.fromTo('.d-row-a', { xPercent: 0 }, { xPercent: -45, duration: 1 }, 0)
      .fromTo('.d-row-b', { xPercent: -45 }, { xPercent: 0, duration: 1 }, 0)
      .fromTo('.d-head .line-inner', { yPercent: 110 }, { yPercent: 0, stagger: 0.03, duration: 0.1, ease: 'power3.out' }, 0.01)
      .to('.d-head', { y: -80, autoAlpha: 0, duration: 0.08 }, 0.12)
      .fromTo(f, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.17)
      .fromTo(f.querySelector('.fw1'), { xPercent: 70 }, { xPercent: -80, duration: 0.7 }, 0.15)
      .fromTo(f.querySelector('.fw2'), { xPercent: -90 }, { xPercent: 50, duration: 0.7 }, 0.15)
      .fromTo(f.querySelector('.fw3'), { xPercent: 110 }, { xPercent: -60, duration: 0.7 }, 0.15)
      .to(f, { autoAlpha: 0, duration: 0.05 }, 0.82);
    // detail cards: clip-path reveal + counter zoom, each drifting on its own plane
    const at = [0.04, 0.42, 0.64];
    q('.d-card').forEach((card, i) => {
      const img = card.querySelector('img');
      const cap = card.querySelectorAll('.d-cap > *');
      tl.fromTo(card.querySelector('.d-frame'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.12, ease: 'power2.out' }, at[i])
        .fromTo(img, { scale: 1.45 }, { scale: 1, duration: 0.3 }, at[i])
        .fromTo(card, { y: '35vh' }, { y: `${-35 - i * 12}vh`, duration: 0.42 }, at[i])
        .fromTo(cap, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.012, duration: 0.06 }, at[i] + 0.05)
        .to(card.querySelector('.d-frame'), { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.1, ease: 'power2.in' }, at[i] + 0.3)
        .to(cap, { autoAlpha: 0, duration: 0.04 }, at[i] + 0.3);
    });
    tl.fromTo('.d-deg', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.02)
      .to('.d-deg', { autoAlpha: 0, duration: 0.04 }, 0.84)
      // venetian shutters close to black — the lab opens
      .fromTo('.d-blinds i', { scaleY: 0 }, { scaleY: 1, transformOrigin: (i) => (i % 2 ? '50% 0%' : '50% 100%'), stagger: 0.012, duration: 0.08, ease: 'power2.in' }, 0.88);
    return unreg;
  });

  return (
    <>
      <section id="design" className="design" ref={ref} aria-labelledby="design-title">
        <div className="pin">
          <div className="d-marquee" aria-hidden>
            <div className="d-row d-row-a">AERODYNAMIC — ENGINEERED — AERODYNAMIC — ENGINEERED —</div>
            <div className="d-row d-row-b outline">IN MOTION — IN MOTION — IN MOTION — IN MOTION —</div>
          </div>
          <div className="d-head">
            <span className="kicker"><Line>02 — Design em movimento</Line></span>
            <h2 id="design-title">
              <Line>Forma que</Line>
              <Line>segue a velocidade.</Line>
            </h2>
          </div>
          {CARDS.map((c) => (
            <figure className={`d-card ${c.cls}`} key={c.n}>
              <div className="d-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`images/${c.img}-sm.webp`} srcSet={`images/${c.img}-sm.webp 800w, images/${c.img}.webp 1400w`} sizes="(max-width: 820px) 50vw, 24vw" alt={c.t} loading="lazy" />
              </div>
              <figcaption className="d-cap">
                <span className="mono">{c.n}</span>
                <strong>{c.t}</strong>
                <span>{c.d}</span>
              </figcaption>
            </figure>
          ))}
          <div className="d-deg mono" aria-hidden>
            <span ref={deg}>000</span>°<em>Rotação</em>
          </div>
          <div className="d-blinds" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => <i key={i} />)}
          </div>
        </div>
      </section>
      <div className="front front-design" ref={front} aria-hidden>
        <span className="fw fw1">FORM</span>
        <span className="fw fw2">FOLLOWS</span>
        <span className="fw fw3">SPEED</span>
      </div>
    </>
  );
}
