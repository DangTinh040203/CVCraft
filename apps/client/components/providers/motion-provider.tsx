'use client';

import { domAnimation, LazyMotion } from 'framer-motion';
import { type PropsWithChildren } from 'react';

export default function MotionProvider({ children }: PropsWithChildren) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
