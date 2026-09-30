import { ImageResponse } from 'next/og';

import { AppIcon } from '@/components/common/app-icon';

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
      <AppIcon
        size={32}
        borderRadius={7}
        fontSize={18}
        letterSpacing='-1px'
      />
    ),
    { ...size },
  );
}
