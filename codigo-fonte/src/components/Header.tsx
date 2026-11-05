'use client';
import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { scrollToId } from '@/lib/scroll';
import { useStore } from '@/lib/store';

export const CHAPTERS = [
  { id: 'hero', label: 'Prólogo' },
  { id: 'design', label: 'Design' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'performance', label: 'Performance' },
  { id: 'detalhes', label: 'Detalhes' },
  { id: 'comprar', label: 'Comprar' },
  { id: 'futuro', label: 'Epílogo' },
];

export default function Header() {
  const ready = useStore((s) => s.ready);
  const count = useStore((s) => s.cart.reduce((a, i) => a + i.qty, 0));
  const bump = useStore((s) => s.bump);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const [chapter, setChapter] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ready) return;
    const sts = CHAPTERS.map((c, i) => {
      const el = document.getElementById(c.id);
      return el
        ? ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setChapter(i) })
        : null;
    });
    const prog = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleY(${s.progress})`),
    });
    return () => {
      sts.forEach((s) => s?.kill());
      prog.kill();
    };
  }, [ready]);

  useEffect(() => {
    if (!bump || !badge.current) return;
    badge.current.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.6)', background: '#ff4a12' }, { transform: 'scale(1)' }],
      { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
  }, [bump]);

  return (
    <>
      <header className={`hdr ${ready ? 'in' : ''}`}>
        <a className="hdr-logo" href="#hero" onClick={(e) => (e.preventDefault(), scrollToId('hero'))} aria-label="VELOCITY — início">
          <svg viewBox="0 0 32 20" aria-hidden>
            <path d="M8 0h7L7 20H0zM20 0h7l-8 20h-7z" />
          </svg>
          <span>VELOCITY</span>
        </a>
        <div className="hdr-chapter" aria-live="polite">
          <span className="mono">{String(chapter + 1).padStart(2, '0')}</span>
          <span className="hdr-sep" />
          <span className="hdr-chapter-label" key={chapter}>
            {CHAPTERS[chapter].label}
          </span>
          <span className="mono dim">/ 07</span>
        </div>
        <nav className="hdr-nav">
          <a href="#tecnologia" onClick={(e) => (e.preventDefault(), scrollToId('tecnologia'))}>Tecnologia</a>
          <a href="#performance" onClick={(e) => (e.preventDefault(), scrollToId('performance'))}>Performance</a>
          <a href="#comprar" onClick={(e) => (e.preventDefault(), scrollToId('comprar'))}>Comprar</a>
          <button className="hdr-cart" onClick={() => setCartOpen(true)} aria-label={`Abrir carrinho, ${count} itens`}>
            Carrinho <span ref={badge} className="hdr-badge">{count}</span>
          </button>
        </nav>
      </header>
      <div className="rail" aria-hidden>
        <div className="rail-fill" ref={bar} />
      </div>
    </>
  );
}
