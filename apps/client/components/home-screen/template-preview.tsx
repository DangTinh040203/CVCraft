'use client';

import 'swiper/css';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { m } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Swiper, type SwiperClass,SwiperSlide } from 'swiper/react';

import { TEMPLATES } from '@/components/templates/registry';
import { sampleResume } from '@/components/templates/sample-resume';
import { TemplateThumbnail } from '@/components/templates/template-thumbnail';
import { fadeInUp, staggerContainer } from '@/styles/animation';

const TemplatePreviewSection = () => {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      className={`
        bg-background relative overflow-hidden px-2 py-16
        md:px-4 md:py-24
      `}
    >
      <m.div
        className='container mx-auto mb-12 max-w-2xl text-center'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <m.span
          variants={fadeInUp}
          className={`
            text-primary bg-primary/10 mb-4 inline-block rounded-full px-4
            py-1.5 text-sm font-semibold tracking-wider uppercase
          `}
        >
          Premium Designs
        </m.span>
        <m.h2
          variants={fadeInUp}
          className={`
            font-display mb-4 text-3xl font-extrabold tracking-tight
            md:text-5xl
          `}
        >
          Choose from <span className='gradient-text'>Professional</span>{' '}
          Templates
        </m.h2>
        <m.p
          variants={fadeInUp}
          className={`
            text-muted-foreground text-base
            md:text-lg
          `}
        >
          Every template you see here is the real thing — the exact
          component that renders your resume, not a mockup.
        </m.p>
      </m.div>

      <div className='relative mx-auto max-w-5xl'>
        <button
          type='button'
          aria-label='Previous template'
          onClick={() => swiperRef.current?.slidePrev()}
          className={`
            border-border/60 bg-background/90 text-foreground absolute top-1/2
            left-1 z-10 hidden size-11 -translate-y-1/2 cursor-pointer
            items-center justify-center rounded-full border shadow-lg
            backdrop-blur-sm transition-all
            hover:bg-primary hover:text-primary-foreground hover:scale-110
            sm:left-2 sm:flex
            md:-left-5
          `}
        >
          <ChevronLeft className='size-5' />
        </button>
        <button
          type='button'
          aria-label='Next template'
          onClick={() => swiperRef.current?.slideNext()}
          className={`
            border-border/60 bg-background/90 text-foreground absolute top-1/2
            right-1 z-10 hidden size-11 -translate-y-1/2 cursor-pointer
            items-center justify-center rounded-full border shadow-lg
            backdrop-blur-sm transition-all
            hover:bg-primary hover:text-primary-foreground hover:scale-110
            sm:right-2 sm:flex
            md:-right-5
          `}
        >
          <ChevronRight className='size-5' />
        </button>

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          centeredSlides
          loop
          spaceBetween={20}
          slidesPerView={1.15}
          breakpoints={{
            640: { slidesPerView: 1.8, spaceBetween: 24 },
            1024: { slidesPerView: 2.4, spaceBetween: 32 },
          }}
          className='!py-4'
        >
          {/* Swiper's own loop-clone logic gets flaky with only
              TEMPLATES.length real slides (it warns "not enough slides for
              loop mode" and the active-slide state desyncs). Repeating the
              real data gives it enough genuine slides for a stable,
              seamless loop instead of relying on its internal cloning. */}
          {Array.from({ length: 3 }, (_, copy) => copy)
            .flatMap((copy) => TEMPLATES.map((template) => ({ template, copy })))
            .map(({ template, copy }, index) => {
            const TemplateComponent = template.component;
            const isActive = index === activeIndex;

            return (
              <SwiperSlide key={`${template.key}-${copy}`} className='!h-auto'>
                <div
                  className={`
                    border-border/60 bg-card relative overflow-hidden
                    rounded-2xl border shadow-lg transition-all duration-500
                    ${isActive ? 'border-primary/40 scale-100 shadow-2xl' : `
                      scale-90 opacity-50
                    `}
                  `}
                >
                  <TemplateThumbnail>
                    <TemplateComponent resume={sampleResume} />
                  </TemplateThumbnail>

                  {template.isPremium && (
                    <Badge className={`
                      absolute top-3 right-3 gap-1 bg-amber-500 text-white
                      shadow-sm
                    `}>
                      <Lock className='size-3' />
                      Premium
                    </Badge>
                  )}

                  {isActive && (
                    <div className='absolute inset-x-0 bottom-0'>
                      {/* Fade strip above a fully opaque block — a
                          fade-to-transparent alone let the resume text
                          underneath show through and collide with the
                          template name/button. */}
                      <div
                        className={`
                          from-background h-10 bg-linear-to-t to-transparent
                        `}
                      />
                      <div className='bg-background p-5 pt-0'>
                        <p className='mb-3 text-center text-sm font-bold'>
                          {template.name}
                        </p>
                        <Button asChild size='lg' className='w-full gap-2'>
                          <Link href={`/builder?template=${template.key}`}>
                            Use this template
                            <ArrowRight className='size-4' />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <m.div
        className='mt-12 text-center'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Link href='/templates'>
          <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size='xl'
              className={`
                group shadow-primary/10 h-14 rounded-full px-10 text-base
                shadow-xl
                lg:text-lg
              `}
            >
              Explore All Templates
              <ChevronRight
                className={`
                  ml-2 h-5 w-5 transition-transform duration-300
                  group-hover:translate-x-1
                `}
              />
            </Button>
          </m.div>
        </Link>
      </m.div>
    </section>
  );
};

export default TemplatePreviewSection;
