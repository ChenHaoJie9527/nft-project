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
    <div className={cn('flex min-h-screen flex-col bg-background', className)}>
      {/* Header - 固定在顶部 */}
      <Header />

      {/* Main Content - 自适应高度，确保footer在底部 */}
      <main className="w-full flex-1">{children}</main>

      {/* Footer - 始终在底部 */}
      <Footer />
    </div>
  );
});

MainLayout.displayName = 'MainLayout';
