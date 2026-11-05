'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PRICE, VARIANTS, formatBRL, useStore } from '@/lib/store';

const FREE_SHIP = 299;

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, remove } = useStore();
  const [notice, setNotice] = useState(false);
  const subtotal = cart.reduce((a, i) => a + i.qty * PRICE, 0);
  const count = cart.reduce((a, i) => a + i.qty, 0);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="cart" initial="hide" animate="show" exit="hide">
          <motion.div
            className="cart-scrim"
            variants={{ hide: { opacity: 0 }, show: { opacity: 1 } }}
            transition={{ duration: 0.5 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Carrinho"
            variants={{ hide: { x: '104%' }, show: { x: 0 } }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <div className="cart-head">
              <h2>
                Carrinho <sup>{count}</sup>
              </h2>
              <button className="cart-close" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho">
                Fechar
              </button>
            </div>
            <div className="cart-ship">
              <span className="mono">{subtotal >= FREE_SHIP ? 'Frete grátis liberado' : 'Frete grátis acima de R$ 299'}</span>
              <div className="cart-ship-bar">
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: Math.min(1, subtotal / FREE_SHIP) }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} />
              </div>
            </div>
            <div className="cart-items">
              <AnimatePresence initial={false}>
                {cart.length === 0 && (
                  <motion.p className="cart-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Seu carrinho está vazio. O asfalto está esperando.
                  </motion.p>
                )}
                {cart.map((item, idx) => {
                  const v = VARIANTS.find((x) => x.id === item.variant)!;
                  return (
                    <motion.div
                      layout
                      key={item.key}
                      className="cart-item"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + idx * 0.06, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }}
                      exit={{ opacity: 0, x: 60, transition: { duration: 0.35 } }}
                    >
                      <div className="cart-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={v.thumb} alt={`VELOCITY X1 ${v.name}`} width={900} height={600} />
                      </div>
                      <div className="cart-info">
                        <strong>VELOCITY X1</strong>
                        <span>{v.name}</span>
                        <span className="mono">Tam. BR {item.size}</span>
                        <div className="cart-qty">
                          <button onClick={() => setQty(item.key, item.qty - 1)} aria-label="Diminuir quantidade">−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => setQty(item.key, item.qty + 1)} aria-label="Aumentar quantidade">+</button>
                        </div>
                      </div>
                      <div className="cart-price">
                        <span>{formatBRL(item.qty * PRICE)}</span>
                        <button className="cart-remove" onClick={() => remove(item.key)}>Remover</button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="cart-foot">
              <div className="cart-total">
                <span>Subtotal</span>
                <strong>{formatBRL(subtotal)}</strong>
              </div>
              <span className="mono dim">ou 10x de {formatBRL(subtotal / 10)} sem juros</span>
              <button className="btn btn-primary" disabled={!cart.length} onClick={() => setNotice(true)}>
                <span>Finalizar compra</span>
              </button>
              <AnimatePresence>
                {notice && (
                  <motion.p
                    className="cart-notice"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onAnimationComplete={() => setTimeout(() => setNotice(false), 2600)}
                  >
                    Projeto conceitual — o checkout está desativado nesta demonstração.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
