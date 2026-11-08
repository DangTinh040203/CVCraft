import { ImageResponse } from 'next/og';

import { AppIcon } from '@/components/common/app-icon';

// Default social preview (Open Graph + Twitter) for every page without its own
export const alt = 'CraftCV - AI resume builder with ATS-friendly CV templates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FEATURES = ['ATS-friendly templates', 'AI writing help', 'Job match'];

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '72px 88px',
        background:
          'linear-gradient(135deg, #121a3a 0%, #2a1a6b 55%, #6c23d7 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <AppIcon size={96} borderRadius={24} />
        <div style={{ display: 'flex', fontSize: 56, fontWeight: 800 }}>
          CraftCV
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 48,
          fontSize: 68,
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: 960,
        }}
      >
        Build an ATS-friendly CV in minutes, with AI.
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 44 }}>
        {FEATURES.map((feature) => (
          <div
            key={feature}
            style={{
              display: 'flex',
              padding: '12px 24px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.14)',
              fontSize: 28,
              color: '#e9e6ff',
            }}
          >
            {feature}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
