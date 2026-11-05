'use client';
import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Line } from '@/lib/split';
import { registerSegment } from '@/lib/stage';
import { useScene } from '@/lib/useScene';

const ITEMS = [
  { img: 'g-knit', ratio: '4 / 5', h: 74, y: -3, fig: 'Fig. 01', t: 'Malha Aerolattice', d: 'Macro — 1:1' },
  { img: 'g-laces', ratio: '4 / 3', h: 40, y: 22, over: true, fig: 'Fig. 02', t: 'Ilhoses termosselados', d: 'Costura & cadarço' },
  { quote: true },
  { img: 'g-side', ratio: '16 / 10', h: 50, y: -14, fig: 'Fig. 03', t: 'Perfil lateral', d: 'Estúdio — grafite' },
  { img: 'g-top', ratio: '4 / 5', h: 64, y: 12, over: true, fig: 'Fig. 04', t: 'Vista superior', d: 'Flat lay' },
  { img: 'g-heel', ratio: '4 / 5', h: 50, y: -18, fig: 'Fig. 05', t: 'Contraforte', d: 'Calcanhar — luz de recorte' },
  { img: 'g-hero', ratio: '16 / 10', h: 54, y: 0, last: true, fig: 'Fig. 06', t: 'Campanha', d: 'Estúdio — luz dramática' },
] as const;

export default function Gallery() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useScene(ref, ({ reduced, q }) => {
    const unreg = registerSegment(ref.current!, 'top bottom', 'bottom bottom', [{ t: 0, pose: { vis: 0, x: 0.9 } }], 5);
    if (reduced) return unreg;
    const section = ref.current!;
    const tr = track.current!;
    const last = section.querySelector<HTMLElement>('.g-item.last .g-frame')!;
    const full = section.querySelector<HTMLElement>('.g-full')!;
    const dist = () => tr.scrollWidth - window.innerWidth;
    const setH = () => {
      // the last card ends exactly centred, so its frame can expand into the viewport
      tr.style.paddingRight = `${(window.innerWidth - last.offsetWidth) / 2}px`;
      section.style.height = `${dist() + window.innerHeight * 2.2}px`;
    };
    setH();
    ScrollTrigger.addEventListener('refreshInit', setH);
    const rect = () => {
      const W = window.innerWidth, H = window.innerHeight;
      const w = last.offsetWidth, h = last.offsetHeight;
      const t = (H - h) / 2, l = (W - w) / 2;
      return `inset(${t}px ${l}px ${t}px ${l}px round 4px)`;
    };
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
    tl.fromTo(tr, { x: 0 }, { x: () => -dist(), duration: 0.82 }, 0)
      .fromTo('.g-back', { xPercent: 10 }, { xPercent: -40, duration: 1 }, 0)
      .fromTo('.g-intro .line-inner', { yPercent: 110 }, { yPercent: 0, stagger: 0.015, duration: 0.06, ease: 'power3.out' }, 0)
      .fromTo(full, { clipPath: rect, autoAlpha: 0 }, { clipPath: rect, autoAlpha: 1, duration: 0.001 }, 0.82)
      .to(full, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.14, ease: 'power2.inOut' }, 0.83)
      .fromTo(full.querySelector('img'), { scale: 1.0 }, { scale: 1.12, duration: 0.17 }, 0.83)
      .to('.g-full-cap', { autoAlpha: 1, y: 0, duration: 0.05 }, 0.92);

    // curved "lens": cards bend in 3D and their photos drift inside the frame
    const items = q('.g-item') as HTMLElement[];
    const imgs = items.map((it) => it.querySelector('img'));
    let on = false;
    const vis = ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onToggle: (s) => (on = s.isActive) });
    const tick = () => {
      if (!on) return;
      const W = window.innerWidth;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const d = (r.left + r.width / 2 - W / 2) / W;
        it.style.transform = `perspective(1400px) translateY(var(--y)) rotateY(${(-d * 22).toFixed(2)}deg) scale(${(1 - Math.min(0.14, Math.abs(d) * 0.12)).toFixed(3)})`;
        const im = imgs[i];
        if (im) im.style.transform = `translate3d(${(-d * 9).toFixed(2)}%, 0, 0) scale(1.18)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      unreg();
      vis.kill();
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refreshInit', setH);
    };
  });

  return (
    <section id="detalhes" className="gallery" ref={ref} aria-labelledby="gallery-title">
      <div className="pin">
        <div className="g-back outline" aria-hidden>DETALHES — DETAILS — DETALHES</div>
        <div className="g-track" ref={track}>
          <div className="g-intro">
            <span className="kicker"><Line>05 — Galeria</Line></span>
            <h2 id="gallery-title">
              <Line>Detalhes que</Line>
              <Line>você sente</Line>
              <Line>antes de ver.</Line>
            </h2>
            <p className="g-intro-p">Seis estudos de um mesmo objeto. Fotografado sob a mesma luz, do micro ao monumental.</p>
          </div>
          {ITEMS.map((it, i) =>
            'quote' in it ? (
              <blockquote className="g-quote" key={i}>
                <span className="mono">Nota de design</span>
                <p>“Cada costura é uma decisão de engenharia. Nenhuma está aqui por acaso.”</p>
                <cite className="mono">— Laboratório VELOCITY, São Paulo</cite>
              </blockquote>
            ) : (
              <figure
                key={i}
                className={`g-item ${'over' in it ? 'over' : ''} ${'last' in it ? 'last' : ''}`}
                style={{ ['--h' as string]: `${it.h}vh`, ['--y' as string]: `${it.y}vh`, ['--ratio' as string]: it.ratio }}
              >
                <div className="g-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`images/${it.img}-sm.webp`} srcSet={`images/${it.img}-sm.webp 1000w, images/${it.img}.webp 2000w`} sizes="60vw" alt={`${it.t} — ${it.d}`} loading="lazy" />
                </div>
                <figcaption>
                  <span className="mono">{it.fig}</span>
                  <strong>{it.t}</strong>
                  <span className="mono dim">{it.d}</span>
                </figcaption>
              </figure>
            ),
          )}
        </div>
        <div className="g-full" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="images/g-hero.webp" alt="" loading="lazy" />
          <div className="g-full-cap">
            <span className="mono">Fig. 06 — Campanha</span>
          </div>
        </div>
      </div>
    </section>
  );
}
