'use client';
import { create } from 'zustand';

export type VariantId = 'ember' | 'glacier' | 'graphite';
export const VARIANTS: { id: VariantId; name: string; swatch: [string, string]; thumb: string }[] = [
  { id: 'ember', name: 'Obsidian / Ember', swatch: ['#0d0d0e', '#ff4a12'], thumb: 'images/t-ember.webp' },
  { id: 'glacier', name: 'Glacier / Signal', swatch: ['#e6e8ea', '#e3261c'], thumb: 'images/t-glacier.webp' },
  { id: 'graphite', name: 'Graphite / Flame', swatch: ['#4b4c50', '#ff3214'], thumb: 'images/t-graphite.webp' },
];
export const PRICE = 1299.9;
export const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export type CartItem = { key: string; variant: VariantId; size: number; qty: number };

type State = {
  ready: boolean;
  webgl: boolean;
  variant: VariantId;
  cart: CartItem[];
  cartOpen: boolean;
  bump: number;
  setReady: () => void;
  setWebgl: (v: boolean) => void;
  setVariant: (v: VariantId) => void;
  add: (variant: VariantId, size: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  setCartOpen: (v: boolean) => void;
};

export const useStore = create<State>((set) => ({
  ready: false,
  webgl: true,
  variant: 'ember',
  cart: [],
  cartOpen: false,
  bump: 0,
  setReady: () => set({ ready: true }),
  setWebgl: (webgl) => set({ webgl }),
  setVariant: (variant) => set({ variant }),
  add: (variant, size) =>
    set((s) => {
      const key = `${variant}-${size}`;
      const found = s.cart.find((i) => i.key === key);
      const cart = found
        ? s.cart.map((i) => (i.key === key ? { ...i, qty: Math.min(9, i.qty + 1) } : i))
        : [...s.cart, { key, variant, size, qty: 1 }];
      return { cart, bump: s.bump + 1 };
    }),
  setQty: (key, qty) => set((s) => ({ cart: s.cart.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(9, qty)) } : i)) })),
  remove: (key) => set((s) => ({ cart: s.cart.filter((i) => i.key !== key) })),
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));
