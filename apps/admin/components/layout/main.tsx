import { cn } from '@/lib/utils';

export function Main({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        `
          flex flex-1 flex-col gap-4 px-4 py-6
          md:mx-auto md:w-full md:max-w-7xl
        `,
        className,
      )}
      {...props}
    />
  );
}
