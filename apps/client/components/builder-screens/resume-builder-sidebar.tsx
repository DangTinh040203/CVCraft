'use client';
import { Card, CardContent } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import {
  type Section,
  sectionConfig,
} from '@/constants/builder-section.constant';

interface ResumeBuilderSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const ResumeBuilderSidebar = ({
  activeSection,
  onSectionChange,
}: ResumeBuilderSidebarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        order-1 h-full w-full
        lg:col-span-2
      `}
    >
      <Card
        className={`
          bg-card/80 border-border/50 sticky top-0 z-20 py-0 backdrop-blur-sm
          lg:top-4
        `}
      >
        <CardContent className='p-2'>
          <nav
            className={`
              scrollbar-hide flex scrollbar-none space-x-2 overflow-x-auto
              lg:flex-col lg:space-y-1 lg:space-x-0
            `}
          >
            {sectionConfig.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  `
                    flex h-10 w-auto shrink-0 cursor-pointer items-center
                    justify-between rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    lg:w-full
                  `,
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow-primary/25 shadow-lg'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className='flex items-center gap-2'>
                  <section.icon className='h-4 w-4' />
                  <span className='whitespace-nowrap'>{section.label}</span>
                </span>
                {activeSection === section.id && (
                  <ChevronRight
                    className={`
                      hidden h-4 w-4
                      lg:block
                    `}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResumeBuilderSidebar;
