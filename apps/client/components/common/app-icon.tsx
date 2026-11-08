// Shared favicon mark used by both app/icon.tsx and app/apple-icon.tsx.
// Next.js requires those two files to live at their exact app-router paths
// to be auto-detected as favicon/apple-touch-icon routes — only the visual
// design underneath is common, so that's what's extracted here.
interface AppIconProps {
  size: number;
  borderRadius: number;
}

export function AppIcon({
  size,
  borderRadius,
}: AppIconProps) {
  const paperWidth = size * 0.53;
  const paperHeight = size * 0.7;

  return (
    <div
      style={{
        background: '#121a3a',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: paperWidth,
          height: paperHeight,
          background: '#f8f7ff',
          borderRadius: size * 0.06,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: '#6355e8',
          fontSize: size * 0.34,
          fontWeight: 800,
          letterSpacing: '-2px',
        }}
      >
        C
        <div
          style={{
            position: 'absolute',
            right: -size * 0.16,
            top: -size * 0.12,
            color: '#afa8ff',
            fontSize: size * 0.3,
            fontWeight: 800,
          }}
        >
          +
        </div>
      </div>
    </div>
  );
}
