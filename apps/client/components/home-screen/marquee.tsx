'use client';
import React from 'react';

const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'];

const Marquee = () => {
  return (
    <section
      className={`
        border-border bg-background relative z-0 overflow-hidden border-y py-12
      `}
    >
      <div
        className={`
          from-background absolute top-0 left-0 z-10 h-full w-24 bg-linear-to-r
          to-transparent
          md:w-32
        `}
      />
      <div
        className={`
          from-background absolute top-0 right-0 z-10 h-full w-24 bg-linear-to-l
          to-transparent
          md:w-32
        `}
      />

      <div className='container mx-auto'>
        <p
          className={`
            text-muted-foreground mb-8 text-center text-xs font-semibold
            tracking-[0.2em] uppercase opacity-70
          `}
        >
          Trusted by professionals worldwide
        </p>

        <div className='flex overflow-hidden'>
          <div
            className='flex items-center gap-20 pr-20'
            style={{
              animation: 'marquee-scroll 30s linear infinite',
              willChange: 'transform',
            }}
          >
            {[...companies, ...companies, ...companies].map((company, i) => (
              <span
                key={i}
                className={`
                  font-display text-muted-foreground text-xl font-bold
                  whitespace-nowrap opacity-40 transition-all duration-300
                  hover:text-primary hover:scale-110 hover:opacity-100
                  md:text-3xl
                `}
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Marquee;
