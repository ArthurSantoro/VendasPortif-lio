'use client';
import { useEffect, useRef, useState } from 'react';
import { annotations, techState } from '@/components/stage/annotations';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { TECH_EXIT, TECH_START, TAU } from '@/lib/poses';
import { Line } from '@/lib/split';
import { registerSegment, stage } from '@/lib/stage';
import { useScene } from '@/lib/useScene';

const LAYERS = [
  { n: '05', t: 'Colarinho & cadarço', d: 'Lingueta sem costura, cadarço achatado antideslizante.', v: 'Lockdown 360' },
  { n: '04', t: 'Cabedal Aerolattice', d: 'Malha engenheirada em zonas: ventila onde precisa, sustenta onde importa.', v: '38 g · 92% reciclado' },
  { n: '03', t: 'Placa de carbono', d: 'Placa curva de fibra de carbono que devolve energia a cada impulso.', v: 'Rigidez 44 N/mm' },
  { n: '02', t: 'Entressola Pulse Foam', d: 'Sistema de amortecimento em espuma PEBA supercrítica.', v: '87% retorno de energia' },
  { n: '01', t: 'Solado Gripline', d: 'Borracha de alta abrasão com tração multidirecional.', v: '1,8 mm · 600 km' },
];

export default function Tech() {
  const ref = useRef<HTMLElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);

  useScene(ref, ({ reduced }) => {
    const tilt = (v: Parameters<typeof TECH_START>[0], explode: number, ry: number) => ({
      ...TECH_START(v), rx: 0.46, ry: -TAU + ry, explode, s: v.mobile ? 0.66 : 0.36, y: v.mobile ? 0.0 : -0.06, rim: 0.6, shadow: 0,
    });
    const unreg = registerSegment(ref.current!, 'top bottom', 'bottom bottom', [
      { t: 0, pose: TECH_START },
      { t: 0.24, pose: (v) => ({ ...TECH_START(v), s: v.mobile ? 0.84 : 0.48 }) },
      { t: 0.33, pose: (v) => tilt(v, 0, -0.62) },
      { t: 0.64, pose: (v) => tilt(v, 1, -0.5) },
      { t: 0.74, pose: (v) => tilt(v, 1, -0.18) },
      { t: 0.84, pose: (v) => ({ ...TECH_START(v), rim: 0.8, s: v.mobile ? 0.8 : 0.42 }) },
      { t: 0.88, pose: (v) => ({ ...TECH_START(v), rim: 1, s: v.mobile ? 0.8 : 0.42 }) },
      { t: 1, pose: TECH_EXIT },
    ], 3);
    const active = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 40%',
      end: 'bottom bottom',
      onUpdate: (s) => (techState.active = s.isActive ? 1 : 0),
      onToggle: (s) => (techState.active = s.isActive ? 1 : 0),
    });
    if (reduced) return () => (unreg(), active.kill());
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: true } });
    tl.fromTo('.t-grid', { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.2 }, 0)
      .fromTo('.t-head .line-inner', { yPercent: 110 }, { yPercent: 0, stagger: 0.02, duration: 0.08, ease: 'power3.out' }, 0.0)
      .fromTo('.t-word-a', { xPercent: 0, opacity: 0.0 }, { xPercent: -14, opacity: 1, duration: 0.5 }, 0.05)
      .fromTo('.t-word-b', { xPercent: 0, opacity: 0.0 }, { xPercent: 14, opacity: 1, duration: 0.5 }, 0.05)
      .fromTo('.t-ruler', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.1)
      .to('.t-word-a, .t-word-b', { opacity: 0, duration: 0.1 }, 0.72)
      .to('.t-head, .t-ruler', { autoAlpha: 0, y: -40, duration: 0.08 }, 0.8)
      // reassembled: the shoe takes off — hard speed lines and a cut to black
      .fromTo('.t-exit i', { scaleX: 0 }, { scaleX: 1, transformOrigin: '100% 50%', stagger: 0.008, duration: 0.08 }, 0.86)
      .to('.t-exit i', { scaleX: 0, transformOrigin: '0% 50%', stagger: 0.008, duration: 0.06 }, 0.95);
    return () => (unreg(), active.kill());
  });

  // The ruler mirrors the real explode value of the 3D model.
  useEffect(() => {
    const thr = [...annotations].reverse().map((a) => a.threshold);
    const tick = () => {
      const ex = stage.current.explode;
      const n = thr.filter((t) => ex > t + 0.03).length;
      setLit((p) => (p === n ? p : n));
    };
    const id = setInterval(tick, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <section id="tecnologia" className="tech" ref={ref} aria-labelledby="tech-title">
        <div className="pin">
          <div className="t-grid" aria-hidden />
          <div className="t-words" aria-hidden>
            <span className="t-word-a outline">ENGINEERED</span>
            <span className="t-word-b outline">LAYER BY LAYER</span>
          </div>
          <div className="t-head">
            <span className="kicker"><Line>03 — Tecnologia e construção</Line></span>
            <h2 id="tech-title">
              <Line>Anatomia</Line>
              <Line>da velocidade.</Line>
            </h2>
          </div>
          <ol className="t-ruler" aria-label="Camadas do VELOCITY X1">
            {[...LAYERS].reverse().map((l, i) => (
              <li key={l.n} className={i < lit ? 'on' : ''}>
                <span className="mono">{l.n}</span>
                <span>{l.t}</span>
              </li>
            ))}
          </ol>
          <div className="t-exit" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ top: `${10 + i * 9.5}%`, height: `${1 + (i % 3)}px` }} />)}
          </div>
          <ul className="sr-only">
            {LAYERS.map((l) => <li key={l.n}>{l.t}: {l.d} {l.v}</li>)}
          </ul>
          <picture className="fallback tech-fallback">
            <img src="images/g-side.webp" alt="Vista lateral do VELOCITY X1" loading="lazy" />
          </picture>
        </div>
      </section>
      <div className="front front-tech" ref={front} aria-hidden>
        <svg className="t-lines" width="100%" height="100%">
          {annotations.map((a, i) => (
            <line key={i} ref={(el) => void (a.line = el)} x1="0" y1="0" x2="0" y2="0" style={{ opacity: 0 }} />
          ))}
        </svg>
        {annotations.map((a, i) => (
          <div key={i}>
            <span className="t-dot" ref={(el) => void (a.dot = el)} style={{ opacity: 0 }} />
            <div className={`t-label ${a.side > 0 ? 'r' : 'l'}`} ref={(el) => void (a.label = el)} style={{ opacity: 0 }}>
              <span className="mono">{LAYERS[i].n} / 05</span>
              <strong>{LAYERS[i].t}</strong>
              <p>{LAYERS[i].d}</p>
              <em className="mono">{LAYERS[i].v}</em>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
