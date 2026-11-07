import './globals.css';
import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Alya Aulia & Muhammad Ismail Marzuki — Undangan Pernikahan',
  description: 'Undangan pernikahan Alya Aulia dan Muhammad Ismail Marzuki.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
