import { Slot } from '@radix-ui/react-slot';
import { cn } from '@repo/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  `
    focus-visible:border-ring focus-visible:ring-ring/50
    focus-visible:ring-[3px]
    aria-invalid:ring-destructive/20 aria-invalid:border-destructive
    dark:aria-invalid:ring-destructive/40
    inline-flex shrink-0 cursor-pointer items-center justify-center gap-2
    rounded-xl text-sm font-medium whitespace-nowrap transition-all outline-none
    hover:shadow-md
    disabled:pointer-events-none disabled:opacity-50
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        default: `
          bg-primary text-primary-foreground shadow-md
          hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg
        `,
        destructive: `
          bg-destructive text-destructive-foreground
          hover:bg-destructive/90
        `,
        outline: `border-primary bg-primary/10 text-primary border`,
        secondary: `bg-primary/10 text-primary`,
        ghost: 'hover:bg-primary hover:text-background',
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
        gradient: `
          gradient-bg text-primary-foreground shadow-md transition-all
          duration-300
          hover:shadow-glow hover:-translate-y-0.5
        `,
        hero: `
          gradient-bg text-primary-foreground font-semibold shadow-lg
          transition-all duration-300
          hover:shadow-glow hover:-translate-y-1
        `,
        glass: `
          glass border-border/50 text-foreground border shadow-sm
          hover:bg-card/90
        `,
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-lg px-6 text-base',
        xl: 'h-14 rounded-xl px-8 text-lg',
        icon: 'size-9',
        'icon-xs': 'size-7',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
