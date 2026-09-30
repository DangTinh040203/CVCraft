// Shared "CV" monogram used by both app/icon.tsx and app/apple-icon.tsx.
// Next.js requires those two files to live at their exact app-router paths
// to be auto-detected as favicon/apple-touch-icon routes — only the visual
// design underneath is common, so that's what's extracted here.
interface AppIconProps {
  size: number;
  borderRadius: number;
  fontSize: number;
  letterSpacing: string;
}

export function AppIcon({
  size,
  borderRadius,
  fontSize,
  letterSpacing,
}: AppIconProps) {
  return (
    <div
      style={{
        // Brand --gradient-primary (violet-700 → violet-600)
        background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius,
        color: 'white',
        fontSize,
        fontWeight: 800,
        letterSpacing,
      }}
    >
      CV
    </div>
  );
}
