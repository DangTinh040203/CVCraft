import '@repo/ui/globals.css';
import '@/styles/theme.css';

import { type Metadata } from 'next';
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { type ReactNode } from 'react';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nest + Next Monorepo',
  description: 'A NestJS + Next.js monorepo starter powered by Turborepo',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`
          ${fontSans.variable}
          ${fontMono.variable}
          font-sans antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}
