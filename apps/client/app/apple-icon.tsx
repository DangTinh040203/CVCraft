import { ImageResponse } from 'next/og';

import { AppIcon } from '@/components/common/app-icon';

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
      <AppIcon
        size={180}
        borderRadius={40}
        fontSize={104}
        letterSpacing='-4px'
      />
    ),
    { ...size },
  );
}
