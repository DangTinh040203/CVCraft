'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ResumeBuilderSidebar from '@/components/builder-screens/resume-builder-sidebar';
import { Section } from '@/constants/builder-section.constant';

const BuilderScreenContainer = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentStep = searchParams.get('step') as Section;
  const [activeSection, setActiveSection] = useState<Section>(
    Object.values(Section).includes(currentStep)
      ? currentStep
      : Section.Personal,
  );

  const handleSectionChange = (section: Section) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', section);
    router.push(`/builder?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const step = searchParams.get('step') as Section;
    const targetSection =
      step && Object.values(Section).includes(step) ? step : Section.Personal;

    if (targetSection !== activeSection) {
      setActiveSection(targetSection);
    }
  }, [searchParams, activeSection]);

  return (
    <main className='container mx-auto px-4 pt-24 pb-20'>
      <div
        className={`
          grid grid-cols-1 gap-6
          lg:grid-cols-12
        `}
      >
        {/* Sidebar */}
        <div
          className={`
            col-span-1
            lg:col-span-2
          `}
        >
          <ResumeBuilderSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* Form Editor */}
        <div
          className={`
            col-span-1
            lg:col-span-7
          `}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam
          incidunt sequi sint corrupti tempore impedit, aperiam vitae amet dolor
          illum fugit in nihil ipsa possimus eos error quod eveniet sapiente.
        </div>

        {/* Preview */}
        <div
          className={`
            col-span-1
            lg:col-span-3
          `}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus minus
          earum vitae distinctio suscipit atque, libero itaque esse aliquid
          minima, sint rerum similique accusantium voluptate delectus dolores
          vero error animi.
        </div>
      </div>
    </main>
  );
};

export default BuilderScreenContainer;
