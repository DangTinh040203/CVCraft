import { ImageResponse } from 'next/og';

// Favicon for CVCraft — bold "CV" monogram on the brand violet gradient.
// Reads far better than a doc glyph at 32px tab size. Next.js injects this
// automatically as <link rel="icon">.
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          // Brand --gradient-primary (violet-700 → violet-600)
          background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          color: 'white',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-1px',
        }}
      >
        CV
      </div>
    ),
    {
      ...size,
    },
  );
}
