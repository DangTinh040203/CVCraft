import { type Metadata } from 'next';
import dynamic from 'next/dynamic';

import { JsonLd } from '@/components/common/json-ld';
import { FAQ_ITEMS } from '@/components/home-screen/faq-items';
import HeroSection from '@/components/home-screen/hero';
import { absoluteUrl, SITE } from '@/configs/site.config';

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  alternates: { canonical: '/' },
};

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: SITE.name,
      url: SITE.url,
      logo: absoluteUrl('/craftcv-logo.svg'),
    },
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      inLanguage: 'en',
      publisher: { '@id': absoluteUrl('/#organization') },
    },
    {
      '@type': 'WebApplication',
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'ATS-friendly resume templates',
        'AI resume writing and rewriting',
        'Import an existing CV from PDF',
        'Resume vs. job description match score',
        'ATS readiness check',
        'AI-drafted application emails',
        'Voice mock interview with feedback',
        'PDF export',
      ],
      publisher: { '@id': absoluteUrl('/#organization') },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

const Marquee = dynamic(() => import('@/components/home-screen/marquee'));
const FeaturesSection = dynamic(
  () => import('@/components/home-screen/features-section'),
);
const HowItWorksSection = dynamic(
  () => import('@/components/home-screen/how-it-works'),
);
const TemplatePreviewSection = dynamic(
  () => import('@/components/home-screen/template-preview'),
);
const WhyChooseUsSection = dynamic(
  () => import('@/components/home-screen/why-choose-us'),
);
const BenefitsSection = dynamic(
  () => import('@/components/home-screen/benefits'),
);
const StatsSection = dynamic(() => import('@/components/home-screen/stats'));
const TestimonialsSection = dynamic(
  () => import('@/components/home-screen/testimonials'),
);
const FAQSection = dynamic(() => import('@/components/home-screen/faq'));
const CTASection = dynamic(() => import('@/components/home-screen/cta'));

export default function HomePage() {
  return (
    <>
      <JsonLd data={STRUCTURED_DATA} />
      <HeroSection />
      <Marquee />
      <FeaturesSection />
      <HowItWorksSection />
      <TemplatePreviewSection />
      <WhyChooseUsSection />
      <BenefitsSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
