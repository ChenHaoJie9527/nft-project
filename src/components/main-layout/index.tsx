'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import Footer from '../footer';
import Header from '../header';

type MainLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export const MainLayout = memo(function MainLayoutComponent({
  children,
  className,
}: MainLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
});

MainLayout.displayName = 'MainLayout';
