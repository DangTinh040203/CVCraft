'use client';

import { Button } from '@repo/ui/components/button';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        animate-in fade-in zoom-in fixed right-8 bottom-8 z-50 duration-300
      `}
    >
      <Button
        size='icon'
        aria-label='Scroll to top'
        className={`
          size-12 rounded-full shadow-lg
          hover:shadow-xl
        `}
        onClick={scrollToTop}
      >
        <ArrowUp className='size-6' />
      </Button>
    </div>
  );
};
