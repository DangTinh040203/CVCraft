import '@repo/ui/globals.css';

import { type Metadata } from 'next';
import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Nest + Next Monorepo',
  description: 'A NestJS + Next.js monorepo starter powered by Turborepo',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
