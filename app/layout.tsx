import './globals.css';
import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Alya & Ismail — Undangan Pernikahan',
  description: 'Undangan pernikahan Alya dan Ismail.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
