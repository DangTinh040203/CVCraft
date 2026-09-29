import { ImageResponse } from 'next/og';

// Apple touch icon (180×180) for iOS home-screen bookmarks — same brand "CV"
// monogram as the favicon, scaled up with iOS-appropriate corner rounding.
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '40px',
          color: 'white',
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: '-4px',
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
