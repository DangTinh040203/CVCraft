'use client';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

interface FloatingDot {
  id: number;
  top: number;
  left: number;
  duration: number;
}

const FloatingElements = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-generate random positions to avoid hydration mismatch
  const floatingDots = useMemo<FloatingDot[]>(() => {
    return [...Array(8)].map((_, i) => ({
      id: i,
      top: 20 + Math.random() * 60,
      left: 10 + Math.random() * 80,
      duration: 3 + Math.random() * 2,
    }));
  }, []);

  return (
    <>
      <motion.div
        className={`
          absolute top-20 right-20 h-32 w-32 rounded-full border border-white/20
        `}
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className={`
          absolute bottom-40 left-10 h-24 w-24 rounded-full border
          border-white/10
        `}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className={`
          absolute top-1/3 right-10 h-16 w-16 rounded-full bg-white/5
          backdrop-blur-sm
        `}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Floating dots - only render after mount to avoid hydration mismatch */}
      {mounted &&
        floatingDots.map((dot) => (
          <motion.div
            key={dot.id}
            className='absolute h-2 w-2 rounded-full bg-white/30'
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              delay: dot.id * 0.3,
            }}
          />
        ))}

      {/* Geometric shapes */}
      <motion.div
        className={`
          absolute top-1/4 left-1/4 h-8 w-8 rotate-45 border-2 border-white/20
        `}
        animate={{ rotate: [45, 135, 45] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className={`
          absolute right-1/4 bottom-1/4 h-6 w-6 rotate-12 rounded-sm bg-white/10
        `}
        animate={{ rotate: [12, -12, 12], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </>
  );
};

export default FloatingElements;
