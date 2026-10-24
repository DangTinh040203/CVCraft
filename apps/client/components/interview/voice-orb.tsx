'use client';

import { cn } from '@repo/ui/lib/utils';
import { type ReactNode, useEffect, useRef } from 'react';

interface VoiceOrbProps {
  /** The level shown; none (or `active` false) rests the orb. */
  analyser: AnalyserNode | null;
  active: boolean;
  /** Primary for the interviewer, emerald for the candidate. */
  tone: 'interviewer' | 'candidate' | 'idle';
  children: ReactNode;
}

const TONES = {
  interviewer: 'bg-primary/25',
  candidate: 'bg-emerald-500/25',
  idle: 'bg-muted',
} as const;

/**
 * A circle whose halo grows with the voice level. Drawn by writing the
 * transform straight to the DOM each frame, not through React state.
 */
export function VoiceOrb({ analyser, active, tone, children }: VoiceOrbProps) {
  const haloRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const halo = haloRef.current;
    const outer = outerRef.current;
    if (!halo || !outer) return;
    if (!analyser || !active) {
      halo.style.transform = 'scale(1)';
      outer.style.transform = 'scale(1)';
      return;
    }

    const samples = new Uint8Array(analyser.fftSize);
    let level = 0;
    let frame = requestAnimationFrame(function draw() {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
      const rms = Math.sqrt(sum / samples.length);
      // Rise fast, fall slowly, so the halo doesn't flicker between words
      level = Math.max(rms, level * 0.9);
      const amount = Math.min(1, level * 4);
      halo.style.transform = `scale(${1 + amount * 0.35})`;
      outer.style.transform = `scale(${1 + amount * 0.7})`;
      frame = requestAnimationFrame(draw);
    });
    return () => cancelAnimationFrame(frame);
  }, [analyser, active]);

  return (
    <div
      className='relative flex size-44 items-center justify-center'
      aria-hidden
    >
      <div
        ref={outerRef}
        className={cn(
          'absolute inset-6 rounded-full opacity-60 transition-colors',
          TONES[tone],
        )}
      />
      <div
        ref={haloRef}
        className={cn(
          'absolute inset-4 rounded-full transition-colors',
          TONES[tone],
        )}
      />
      <div
        className={cn(
          `
            relative flex size-28 items-center justify-center rounded-full
            text-white shadow-lg transition-colors duration-300
          `,
          tone === 'candidate'
            ? 'bg-linear-to-br from-emerald-500 to-emerald-600'
            : tone === 'interviewer'
              ? 'from-primary to-primary/70 bg-linear-to-br'
              : 'bg-muted-foreground/40',
        )}
      >
        {children}
      </div>
    </div>
  );
}
