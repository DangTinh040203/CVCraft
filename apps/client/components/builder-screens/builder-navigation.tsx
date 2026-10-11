'use client';

import { Button } from '@repo/ui/components/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface BuilderNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  disableBack?: boolean;
  disableNext?: boolean;
  loading?: boolean;
  nextLabel?: string;
}

const BuilderNavigation = ({
  onBack,
  onNext,
  disableBack,
  disableNext,
  loading,
  nextLabel,
}: BuilderNavigationProps) => {

  return (
    <div
      className={`
        border-border/50 mt-6 flex items-center justify-between border-t pt-6
      `}
    >
      <Button
        variant='outline'
        onClick={onBack}
        disabled={disableBack || !onBack}
        className='min-w-32 gap-2'
        type='button'
      >
        <ChevronLeft className='h-4 w-4' />
        {'Back'}
      </Button>

      <Button
        onClick={onNext}
        disabled={disableNext || loading}
        className='min-w-32 gap-2'
        type='submit' // Default to submit for forms
      >
        {loading ? 'Saving...' : (nextLabel ?? 'Next')}
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
};

export default BuilderNavigation;
