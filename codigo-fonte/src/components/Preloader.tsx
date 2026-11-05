'use client';
import { useProgress } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { stage } from '@/lib/stage';
import { useStore } from '@/lib/store';

export default function Preloader() {
  const { progress, active } = useProgress();
  const webgl = useStore((s) => s.webgl);
  const setReady = useStore((s) => s.setReady);
  const root = useRef<HTMLDivElement>(null);
  const shown = useRef({ v: 0 });
  const [n, setN] = useState(0);
  const done = useRef(false);

  // Smoothly chase the real loading progress; never stall forever.
  useEffect(() => {
    const started = performance.now();
    const id = setInterval(() => {
      const elapsed = performance.now() - started;
      const real = !webgl || elapsed > 12000 ? 100 : progress >= 100 && !active ? 100 : Math.min(progress, 96);
      const floor = Math.min(elapsed / 18, 30);
      const target = Math.max(real, floor);
      shown.current.v += (target - shown.current.v) * 0.12;
      if (target === 100 && shown.current.v > 99.4) shown.current.v = 100;
      setN(Math.round(shown.current.v));
      if (shown.current.v >= 100 && !done.current && elapsed > 1300) {
        done.current = true;
        clearInterval(id);
        finish();
      }
    }, 30);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, active, webgl]);

  const finish = () => {
    const el = root.current!;
    const tl = gsap.timeline({ onComplete: () => el.remove() });
    tl.to(el.querySelectorAll('.pl-word .ch'), { yPercent: -110, stagger: 0.03, duration: 0.6, ease: 'power3.in' })
      .to(el.querySelector('.pl-count'), { opacity: 0, duration: 0.3 }, '<')
      .to(el.querySelector('.pl-bar'), { scaleX: 0, transformOrigin: '100% 50%', duration: 0.5, ease: 'power3.inOut' }, '<')
      .add(() => setReady(), '-=0.1')
      .to(el.querySelector('.pl-top'), { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '+=0')
      .to(el.querySelector('.pl-bot'), { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
      .to(stage, { intro: 1, duration: 2.2, ease: 'expo.out' }, '<0.35');
  };

  return (
    <div className="preloader" ref={root} role="status" aria-label="Carregando experiência">
      <div className="pl-top" />
      <div className="pl-bot" />
      <div className="pl-center">
        <div className="pl-word" aria-hidden>
          {'VELOCITY'.split('').map((c, i) => (
            <span className="ch" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
              {c}
            </span>
          ))}
        </div>
        <div className="pl-meta">
          <span>Performance Lab — SS26</span>
          <span className="pl-count">{String(n).padStart(3, '0')}</span>
        </div>
        <div className="pl-bar" style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </div>
  );
}
