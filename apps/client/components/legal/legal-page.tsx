import { type ReactNode } from 'react';

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <section className='relative'>
      <div className='absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden'>
        <div
          className={`
            from-background via-primary/8 to-background absolute inset-0
            bg-linear-to-b
          `}
        />
        <div
          className={`
            bg-primary/10 absolute top-[-10%] right-[-8%] h-[220px] w-[220px]
            rounded-full blur-[80px]
            md:bg-primary/20 md:h-[420px] md:w-[420px] md:blur-[100px]
          `}
        />
      </div>

      <div className={`
        container mx-auto px-4 pt-24 pb-16
        md:px-6 md:pt-32
      `}>
        <div className='mx-auto max-w-3xl'>
          <h1
            className={`
              font-display mb-3 text-3xl font-extrabold tracking-tight
              md:text-5xl
            `}
          >
            {title}
          </h1>
          <p className={`
            text-muted-foreground mb-1 text-base
            md:text-lg
          `}>
            {description}
          </p>
          <p className='text-muted-foreground mb-12 text-sm'>
            Last updated: {lastUpdated}
          </p>

          <div className='space-y-10'>
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className='font-display mb-3 text-xl font-bold'>
                  {section.heading}
                </h2>
                <div
                  className={`
                    text-muted-foreground space-y-3 text-sm leading-relaxed
                    [&_a]:text-primary [&_a]:hover:underline
                    md:text-base
                    [&_li]:ml-5 [&_li]:list-disc
                    [&_ul]:space-y-2
                  `}
                >
                  {section.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
