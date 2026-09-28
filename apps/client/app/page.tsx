import dynamic from 'next/dynamic';

import HeroSection from '@/components/home-screen/hero';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

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
    <div>
      <Header />
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
      <Footer />
    </div>
  );
}
