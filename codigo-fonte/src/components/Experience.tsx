'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import CartDrawer from './CartDrawer';
import Cursor from './Cursor';
import Header from './Header';
import Preloader from './Preloader';
import SmoothScroll from './SmoothScroll';
import Design from './sections/Design';
import Finale from './sections/Finale';
import Footer from './sections/Footer';
import Gallery from './sections/Gallery';
import Hero from './sections/Hero';
import Performance from './sections/Performance';
import Product from './sections/Product';
import Tech from './sections/Tech';

const Stage = dynamic(() => import('./stage/Stage'), { ssr: false });

export default function Experience() {
  const webgl = useStore((s) => s.webgl);
  useEffect(() => void document.documentElement.classList.toggle('no-webgl', !webgl), [webgl]);
  return (
    <>
      <SmoothScroll />
      <Preloader />
      <Header />
      <Cursor />
      {webgl && <Stage />}
      <main>
        <Hero />
        <Design />
        <Tech />
        <Performance />
        <Gallery />
        <Product />
        <Finale />
      </main>
      <Footer />
      <CartDrawer />
      <div className="grain" aria-hidden />
    </>
  );
}
