import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'], display: 'swap' });

export const metadata: Metadata = {
  title: 'VELOCITY X1',
  description: 'VELOCITY X1: tênis de corrida de alta performance com placa de carbono e espuma Pulse Foam. Uma experiência cinematográfica de produto.',
};
export const viewport: Viewport = { themeColor: '#060606', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
