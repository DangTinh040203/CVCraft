import '@repo/ui/globals.css';
import '@/styles/theme.css';

import { type Metadata } from 'next';
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { type ReactNode } from 'react';

import { ScrollToTop } from '@/components/common/scroll-to-top';
import MotionProvider from '@/components/providers/motion-provider';

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
  title: {
    default: 'CVCraft - AI-Powered Professional CV Builder',
    template: '%s | CVCraft',
  },
  description:
    'Build a stunning, professional, and ATS-optimized CV in minutes with CVCraft.',
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
        <MotionProvider>
          <ScrollToTop />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
