import '@repo/ui/globals.css';
import '@/app/theme-dracula.css';

import { Toaster } from '@repo/ui/components/sonner';
import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { NavigationProgress } from '@/components/navigation-progress';
import { ThemeProvider } from '@/components/theme-provider';
import { SearchProvider } from '@/lib/search-context';

export const metadata: Metadata = {
  title: 'Resume Builder — Admin',
  description: 'Internal admin dashboard for Resume Builder',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NavigationProgress />
          <SearchProvider>{children}</SearchProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
