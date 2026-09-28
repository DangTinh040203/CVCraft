'use client';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { AnimatePresence, m } from 'framer-motion';
import { FileText, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/templates', label: 'Templates', icon: FileText },
];

const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.1,
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  }),
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
  exit: { opacity: 0, x: -20 },
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <m.nav
      className={cn(
        'relative z-50 transition-all duration-300',
        pathname === '/'
          ? 'fixed top-0 right-0 left-0'
          : 'bg-background border-b',
        pathname === '/' &&
          (isScrolled || isOpen) &&
          'glass border-border/50 border-b shadow-md',
      )}
      variants={headerVariants}
      initial='hidden'
      animate='visible'
    >
      <div className='container mx-auto overflow-x-hidden px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Animated Logo */}
          <m.div variants={logoVariants} initial='hidden' animate='visible'>
            <Link
              href='/'
              className='group flex items-center gap-2 select-none'
            >
              <m.div
                className={`
                  gradient-bg flex h-9 w-9 items-center justify-center
                  rounded-lg shadow-md
                `}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <m.div>
                  <FileText className='text-primary-foreground h-5 w-5' />
                </m.div>
              </m.div>
              <m.span
                className='font-display text-xl font-bold'
                whileHover={{ scale: 1.05 }}
              >
                CV<span className='gradient-text'>Craft</span>
              </m.span>
            </Link>
          </m.div>

          {/* Desktop Navigation with staggered animation */}
          <div
            className={`
              hidden items-center gap-4
              md:flex
            `}
          >
            {navLinks.map((link, i) => (
              <m.div
                key={link.href}
                custom={i}
                variants={navItemVariants}
                initial='hidden'
                animate='visible'
              >
                <Link href={link.href}>
                  <m.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Button
                      className={cn('relative gap-2 overflow-hidden')}
                      variant={isActive(link.href) ? 'default' : 'ghost'}
                    >
                      <m.span
                        animate={
                          isActive(link.href) ? { rotate: [0, -10, 10, 0] } : {}
                        }
                        transition={{ duration: 0.5 }}
                      >
                        <link.icon className='h-4 w-4' />
                      </m.span>
                      {link.label}
                    </Button>
                  </m.div>
                </Link>
              </m.div>
            ))}
          </div>

          {/* Auth Buttons with animation */}
          <div
            className={`
              hidden items-center gap-2
              md:flex
            `}
          >
            <m.div
              custom={navLinks.length}
              variants={navItemVariants}
              initial='hidden'
              animate='visible'
              className={`
                hidden
                lg:block
              `}
            >
              <Link href='/auth/sign-in'>
                <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant='ghost'>Sign In</Button>
                </m.div>
              </Link>
            </m.div>

            <m.div
              custom={navLinks.length + 1}
              variants={navItemVariants}
              initial='hidden'
              animate='visible'
            >
              <Link href='/auth/sign-in'>
                <m.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button variant='gradient'>Get Started</Button>
                </m.div>
              </Link>
            </m.div>
          </div>

          {/* Animated Mobile Menu Button */}
          <div
            className={`
              flex items-center gap-2
              md:hidden
            `}
          >
            <m.div whileTap={{ scale: 0.9 }}>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsOpen(!isOpen)}
              >
                <AnimatePresence mode='wait'>
                  {isOpen ? (
                    <m.div
                      key='close'
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className='h-5 w-5' />
                    </m.div>
                  ) : (
                    <m.div
                      key='menu'
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className='h-5 w-5' />
                    </m.div>
                  )}
                </AnimatePresence>
              </Button>
            </m.div>
          </div>
        </div>

        {/* Animated Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <m.div
              className={`
                fixed top-16 right-0 left-0 overflow-hidden rounded-b-lg
                bg-white px-2 shadow
                md:hidden
              `}
              variants={mobileMenuVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
            >
              <div className='flex flex-col gap-1 pt-4 pb-2'>
                {navLinks.map((link, i) => (
                  <m.div
                    key={link.href}
                    custom={i}
                    variants={mobileItemVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                  >
                    <Link href={link.href} onClick={() => setIsOpen(false)}>
                      <m.div whileTap={{ scale: 0.98, x: 5 }}>
                        <Button
                          variant={isActive(link.href) ? 'secondary' : 'ghost'}
                          className='w-full justify-start gap-3'
                        >
                          <link.icon className='h-4 w-4' />
                          {link.label}
                        </Button>
                      </m.div>
                    </Link>
                  </m.div>
                ))}
                <m.div
                  custom={navLinks.length}
                  variants={mobileItemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                >
                  <Link href='/auth/sign-in' onClick={() => setIsOpen(false)}>
                    <m.div whileTap={{ scale: 0.98 }} whileHover={{}}>
                      <Button variant='gradient' className='mt-2 w-full'>
                        Sign In / Sign Up
                      </Button>
                    </m.div>
                  </Link>
                </m.div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.nav>
  );
};

export default Header;
