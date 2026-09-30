'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { m } from 'framer-motion';
import React from 'react';

import BlurText from '@/components/common/blur-text';
import ShinyText from '@/components/common/shiny-text';

const faqs = [
  {
    q: 'Is CVCraft really free to use?',
    a: 'Yes! You can create and download your CV for free. We offer premium templates and advanced AI features for users who want extra polish.',
  },
  {
    q: 'How does the AI CV writing work?',
    a: "Our AI analyzes your experience and the job description you're targeting. It then suggests impactful bullet points, optimizes keywords, and ensures your CV is tailored for the role.",
  },
  {
    q: 'Are the templates ATS-friendly?',
    a: 'Absolutely. All our templates are designed to pass Applicant Tracking Systems while still looking professional and modern.',
  },
  {
    q: 'Can I edit my CV after downloading?',
    a: 'Yes! Your CVs are saved to your account. You can come back anytime to make edits and download updated versions.',
  },
  {
    q: 'How does the mock interview feature work?',
    a: 'Our AI interviewer asks you common questions for your target role. You can practice answering verbally, and the AI provides feedback on your responses.',
  },
];

const FAQSection = () => {
  return (
    <section
      className={`
        bg-background relative overflow-hidden px-2 py-8
        md:px-4 md:py-24
      `}
    >
      <div className='relative z-10 container mx-auto max-w-3xl'>
        <m.div
          className='mb-20 text-center'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`
              text-primary bg-primary/10 mb-6 inline-block rounded-full px-4
              py-1.5 text-sm font-semibold tracking-wider uppercase
            `}
          >
            <ShinyText
              text='Support Center'
              speed={3}
              className='text-sm font-semibold tracking-wider uppercase'
            />
          </m.div>
          <BlurText
            text='Frequently Asked Questions'
            delay={80}
            animateBy='words'
            direction='top'
            className={`
              font-display mb-6 flex-wrap justify-center text-3xl font-extrabold
              tracking-tight
              md:text-5xl
            `}
          />
          <p
            className={`
              text-muted-foreground mx-auto max-w-xl text-base leading-relaxed
              md:text-lg
            `}
          >
            Everything you need to know about CVCraft and how it can help you
            land your dream job.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <Accordion type='single' collapsible className='w-full space-y-4'>
            {faqs.map((faq, index) => (
              <m.div
                key={faq.q}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className={`
                    bg-card/40 border-border/50 rounded-2xl border px-6
                    backdrop-blur-sm transition-all duration-300
                    hover:border-primary/20
                    last:border-b
                  `}
                >
                  <AccordionTrigger
                    className={`
                      hover:text-primary hover:no-underline
                      py-6 text-left text-base font-bold transition-colors
                      md:text-lg
                    `}
                  >
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent
                    className={`
                      text-muted-foreground pb-6 text-base leading-relaxed
                    `}
                  >
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </m.div>
            ))}
          </Accordion>
        </m.div>
      </div>
    </section>
  );
};

export default FAQSection;
