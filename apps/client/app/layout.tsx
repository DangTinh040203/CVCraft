import '@repo/ui/globals.css';
import '@/styles/theme.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@repo/ui/components/sonner';
import { TooltipProvider } from '@repo/ui/components/tooltip';
import { type Metadata } from 'next';
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { type ReactNode } from 'react';

import { ScrollToTop } from '@/components/common/scroll-to-top';
import MotionProvider from '@/components/providers/motion-provider';
import StoreProvider from '@/components/providers/store-provider';
import { resumeFontVariables } from '@/configs/font.config';

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
    default: 'CraftCV - AI-Powered Professional CV Builder',
    template: '%s | CraftCV',
  },
  description:
    'Build a stunning, professional, and ATS-optimized CV in minutes with CraftCV.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl='/builder'
      afterSignOutUrl='/auth/sign-in'
    >
      <html lang='en' suppressHydrationWarning className='overflow-x-hidden'>
        <body
          className={`
            ${fontSans.variable}
            ${fontMono.variable}
            ${resumeFontVariables}
            w-full max-w-screen scrollbar-thin overflow-x-hidden font-sans
            antialiased
          `}
        >
          <StoreProvider>
            <MotionProvider>
              <Toaster richColors />
              <NextTopLoader
                color='#6c23d7'
                showSpinner={false}
                easing='ease-in-out'
              />
              <ScrollToTop />
              {/* One provider for every tooltip in the app */}
              <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            </MotionProvider>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
