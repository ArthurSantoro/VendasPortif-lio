'use client';
import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { scrollToId } from '@/lib/scroll';
import { useScene } from '@/lib/useScene';

const COLS = [
  { t: 'Loja', l: ['VELOCITY X1', 'Coleção SS26', 'Vestuário', 'Cartão-presente'] },
  { t: 'Marca', l: ['Laboratório', 'Atletas', 'Sustentabilidade', 'Carreiras'] },
  { t: 'Ajuda', l: ['Pedidos', 'Trocas e devoluções', 'Guia de tamanhos', 'Contato'] },
];

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  useScene(ref, ({ reduced, q }) => {
    if (reduced) return;
    gsap.fromTo(q('.ft-word .ch'), { yPercent: 105 }, {
      yPercent: 0, ease: 'none', stagger: 0.04,
      scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom bottom', scrub: true },
    });
  });
  return (
    <footer className="footer" ref={ref}>
      <div className="ft-top">
        <form className="ft-news" onSubmit={(e) => (e.preventDefault(), setSent(true))}>
          <label htmlFor="news" className="kicker">Primeiro a saber. Primeiro a largar.</label>
          <div className="ft-field">
            <input id="news" type="email" required placeholder="seu@email.com" disabled={sent} />
            <button type="submit" className="btn btn-primary" disabled={sent}>
              <span>{sent ? 'Inscrito ✓' : 'Inscrever'}</span>
            </button>
          </div>
        </form>
        {COLS.map((c) => (
          <nav className="ft-col" key={c.t} aria-label={c.t}>
            <span className="mono dim">{c.t}</span>
            {c.l.map((l) => (
              <a key={l} href="#comprar" onClick={(e) => (e.preventDefault(), l === 'VELOCITY X1' && scrollToId('comprar'))}>{l}</a>
            ))}
          </nav>
        ))}
      </div>
      <div className="ft-word" aria-hidden>
        {'VELOCITY'.split('').map((c, i) => (
          <span className="ch-wrap" key={i}><span className="ch">{c}</span></span>
        ))}
      </div>
      <div className="ft-bottom mono">
        <span>© 2026 VELOCITY Performance Lab — marca fictícia, projeto conceitual.</span>
        <span>
          Modelo 3D base: “Materials Variants Shoe” © 2021 Shopify, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> — recolorido e reiluminado.
        </span>
        <span><a href="#futuro" onClick={(e) => e.preventDefault()}>Privacidade</a> · <a href="#futuro" onClick={(e) => e.preventDefault()}>Termos</a></span>
      </div>
    </footer>
  );
}
