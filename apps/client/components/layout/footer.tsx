'use client';
import { m } from 'framer-motion';
import { FileText } from 'lucide-react';
import React from 'react';

import { fadeInUp, staggerContainer } from '@/styles/animation';

const sections = [
  {
    title: 'Product',
    links: [
      { label: 'Templates', href: '/templates' },
      { label: 'CV Builder', href: '#' },
      { label: 'Mock Interviews', href: '#' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className='border-border bg-muted/30 border-t px-4 py-12'>
      <div className='container mx-auto'>
        <m.div
          className={`
            grid grid-cols-2 gap-8
            md:grid-cols-4
          `}
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <m.div variants={fadeInUp} className={`
            col-span-2
            md:col-span-1
          `}>
            <div className='mb-4 flex items-center gap-2'>
              <m.div
                className={`
                  gradient-bg flex h-8 w-8 items-center justify-center
                  rounded-lg
                `}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className='text-primary-foreground h-5 w-5' />
              </m.div>
              <span className='font-display text-xl font-bold'>CraftCV</span>
            </div>
            <p className='text-muted-foreground text-sm'>
              The AI-powered CV builder that helps you land your dream job.
            </p>
          </m.div>

          {sections.map((section) => (
            <m.div key={section.title} variants={fadeInUp}>
              <h4 className='mb-4 font-semibold'>{section.title}</h4>
              <ul className='space-y-2'>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <m.a
                      href={link.href}
                      className={`
                        text-muted-foreground text-sm transition-colors
                        hover:text-foreground
                      `}
                      whileHover={{ x: 5 }}
                    >
                      {link.label}
                    </m.a>
                  </li>
                ))}
              </ul>
            </m.div>
          ))}
        </m.div>

        <m.div
          className={`
            border-border text-muted-foreground mt-12 border-t pt-8 text-center
            text-sm
          `}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          © 2026 CraftCV - Cao Dang Tinh. All rights reserved.
        </m.div>
      </div>
    </footer>
  );
};

export default Footer;
