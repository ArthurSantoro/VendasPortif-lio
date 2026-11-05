'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { TAU } from '@/lib/poses';
import { Line } from '@/lib/split';
import { anchorPose, registerSegment, stage } from '@/lib/stage';
import { PRICE, VARIANTS, formatBRL, useStore } from '@/lib/store';
import { useScene } from '@/lib/useScene';

const SIZES = [37, 38, 39, 40, 41, 42, 43, 44, 45];
const SOLD_OUT = [44];
const SPECS = [
  ['Peso', '212 g (tam. 40)'],
  ['Drop', '8 mm (38 / 30 mm)'],
  ['Placa', 'Fibra de carbono full-length'],
  ['Entressola', 'Pulse Foam PEBA'],
  ['Uso', 'Prova, ritmo e longões'],
];

export const productAnchor: { el: HTMLElement | null } = { el: null };
export const productPose = () => ({ ...anchorPose(productAnchor.el), ry: -TAU - 0.42, rx: 0.14, rz: 0.03, shadow: 1, rim: 0.5, drag: 1 });

type BtnState = 'idle' | 'error' | 'loading' | 'done';

export default function Product() {
  const ref = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const { variant, setVariant, add, setCartOpen, webgl } = useStore();
  const [size, setSize] = useState<number | null>(null);
  const [btn, setBtn] = useState<BtnState>('idle');
  const [open, setOpen] = useState<number | null>(0);
  const current = VARIANTS.find((v) => v.id === variant)!;

  useScene(ref, ({ reduced, q }) => {
    productAnchor.el = anchor.current;
    const u1 = registerSegment(ref.current!, 'top bottom', 'top top', [
      { t: 0, pose: () => ({ ...productPose(), ry: -TAU - 2.6, vis: 0, y: 0.6, drag: 0 }) },
      { t: 0.55, pose: () => ({ ...productPose(), ry: -TAU - 1.4, vis: 1, drag: 0 }) },
      { t: 1, pose: productPose },
    ], 6);
    const u2 = registerSegment(ref.current!, 'top top', 'bottom bottom', [{ t: 0, pose: productPose }], 7);
    if (!reduced) {
      gsap.fromTo(q('.pr-info .line-inner'), { yPercent: 110 }, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05,
        scrollTrigger: { trigger: ref.current, start: 'top 45%' },
      });
      gsap.fromTo(q('.pr-fade'), { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.07,
        scrollTrigger: { trigger: ref.current, start: 'top 40%' },
      });
      gsap.fromTo(q('.pr-ring'), { scale: 0.6, autoAlpha: 0, rotate: -40 }, {
        scale: 1, autoAlpha: 1, rotate: 0, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', end: 'top 20%', scrub: true },
      });
    }
    return () => (u1(), u2());
  });

  // drag-to-rotate with inertia
  useEffect(() => {
    const el = anchor.current!;
    let down = false, lastX = 0, vel = 0;
    const onDown = (e: PointerEvent) => {
      down = true; lastX = e.clientX; vel = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      vel = dx * 0.012; stage.dragRy += vel;
    };
    const onUp = () => (down = false);
    const tick = () => {
      if (!down && Math.abs(vel) > 0.0001) { vel *= 0.94; stage.dragRy += vel; }
      if (!down && Math.abs(vel) < 0.002) stage.dragRy += (Math.round(stage.dragRy / TAU) * TAU - stage.dragRy) * 0.04;
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    gsap.ticker.add(tick);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      gsap.ticker.remove(tick);
    };
  }, []);

  useEffect(() => void ScrollTrigger.refresh(), [open]);

  const addToCart = () => {
    if (btn === 'loading') return;
    if (size == null) {
      setBtn('error');
      return;
    }
    setBtn('loading');
    setTimeout(() => {
      add(variant, size);
      setBtn('done');
      setTimeout(() => setCartOpen(true), 650);
      setTimeout(() => setBtn('idle'), 2600);
    }, 900);
  };

  return (
    <section id="comprar" className="product" ref={ref} aria-labelledby="product-title">
      <div className="pr-stage" ref={anchor} data-cursor="drag" aria-label="Visualizador 3D: arraste para girar">
        <div className="pr-spot" aria-hidden />
        <svg className="pr-ring" viewBox="0 0 600 160" aria-hidden>
          <ellipse cx="300" cy="80" rx="290" ry="70" />
          <ellipse cx="300" cy="80" rx="230" ry="52" className="dim" />
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i / 48) * Math.PI * 2;
            return <circle key={i} cx={300 + Math.cos(a) * 290} cy={80 + Math.sin(a) * 70} r={i % 12 === 0 ? 3 : 1.2} className={i % 12 === 0 ? 'hot' : ''} />;
          })}
        </svg>
        <div className="pr-hint mono" aria-hidden>
          <span>⟲</span> Arraste para girar
        </div>
        <div className="pr-tag mono" aria-hidden>
          <span>X1 / {current.name}</span>
          <span>360° — Estúdio</span>
        </div>
        {!webgl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="pr-fallback" src={current.thumb} alt={`VELOCITY X1 ${current.name}`} />
        )}
      </div>

      <div className="pr-info">
        <span className="kicker"><Line>06 — Corrida / Road racing</Line></span>
        <h2 id="product-title">
          <Line>VELOCITY</Line>
          <Line><span className="accent">X1</span></Line>
        </h2>
        <p className="pr-desc pr-fade">
          Nosso super tênis mais rápido. Placa de carbono de comprimento total, entressola Pulse Foam e cabedal Aerolattice
          que pesa menos que uma folha de papel molhada. Feito para PRs — e para tudo o que vem depois.
        </p>
        <div className="pr-price pr-fade">
          <strong>{formatBRL(PRICE)}</strong>
          <span className="mono dim">ou 10x de {formatBRL(PRICE / 10)} sem juros</span>
        </div>

        <fieldset className="pr-opt pr-fade">
          <legend>
            Cor <span className="dim">— {current.name}</span>
          </legend>
          <div className="pr-swatches">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                className={`sw ${variant === v.id ? 'on' : ''}`}
                aria-pressed={variant === v.id}
                aria-label={v.name}
                onClick={() => setVariant(v.id)}
                style={{ ['--a' as string]: v.swatch[0], ['--b' as string]: v.swatch[1] }}
              >
                <i />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={`pr-opt pr-fade ${btn === 'error' ? 'shake' : ''}`} onAnimationEnd={() => btn === 'error' && setBtn('idle')}>
          <legend>
            Tamanho <span className="dim">— BR</span>
            <a className="pr-guide" href="#comprar" onClick={(e) => e.preventDefault()}>Guia de tamanhos</a>
          </legend>
          <div className="pr-sizes">
            {SIZES.map((s) => {
              const out = SOLD_OUT.includes(s);
              return (
                <button key={s} disabled={out} className={`sz ${size === s ? 'on' : ''}`} aria-pressed={size === s} onClick={() => { setSize(s); setBtn('idle'); }}>
                  {s}
                  {out && <span className="sr-only"> (esgotado)</span>}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {btn === 'error' && (
              <motion.p className="pr-err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert">
                Selecione um tamanho para continuar.
              </motion.p>
            )}
          </AnimatePresence>
        </fieldset>

        <button className={`btn btn-buy pr-fade is-${btn}`} onClick={addToCart} aria-live="polite">
          <span className="btn-fill" />
          <span className="btn-label">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={btn === 'error' ? 'idle' : btn} initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '-110%' }} transition={{ duration: 0.35, ease: [0.7, 0, 0.3, 1] }}>
                {btn === 'loading' ? 'Adicionando…' : btn === 'done' ? 'Adicionado ✓' : 'Adicionar ao carrinho'}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="btn-price mono">{formatBRL(PRICE)}</span>
        </button>

        <ul className="pr-perks pr-fade mono">
          <li>Frete grátis para todo o Brasil</li>
          <li>30 dias de teste na rua</li>
          <li>Troca de tamanho sem custo</li>
        </ul>

        <div className="pr-acc pr-fade">
          {[
            { t: 'Especificações', body: <dl>{SPECS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl> },
            { t: 'Materiais & cuidado', body: <p>Cabedal 92% poliéster reciclado. Lave à mão em água fria, seque à sombra. Não use secadora.</p> },
          ].map((a, i) => (
            <div className={`acc ${open === i ? 'open' : ''}`} key={a.t}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {a.t}
                <span aria-hidden>{open === i ? '−' : '+'}</span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div className="acc-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}>
                    <div className="acc-inner">{a.body}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
