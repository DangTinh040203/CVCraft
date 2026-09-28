import { Button } from '@repo/ui/components/button';

export default function HomePage() {
  return (
    <main className={`
      flex min-h-screen flex-col items-center justify-center gap-6
    `}>
      <h1 className='text-4xl font-bold'>Nest + Next Monorepo</h1>
      <p className='text-muted-foreground'>
        Turborepo · Next.js · NestJS · Tailwind CSS · shadcn/ui
      </p>
      <Button>Get started</Button>
    </main>
  );
}
