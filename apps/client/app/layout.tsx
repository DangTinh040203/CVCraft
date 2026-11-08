import '@repo/ui/globals.css';
import '@/styles/theme.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@repo/ui/components/sonner';
import { TooltipProvider } from '@repo/ui/components/tooltip';
import { type Metadata, type Viewport } from 'next';
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { type ReactNode } from 'react';

import { ScrollToTop } from '@/components/common/scroll-to-top';
import MotionProvider from '@/components/providers/motion-provider';
import StoreProvider from '@/components/providers/store-provider';
import { resumeFontVariables } from '@/configs/font.config';
import { SITE } from '@/configs/site.config';

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
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'productivity',
  formatDetection: { email: false, address: false, telephone: false },
  // Pages override this with their own path; the default points at the home
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    url: '/',
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
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
