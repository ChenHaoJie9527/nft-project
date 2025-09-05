'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import BottomNavigation from '../bottom-navigation';
import Footer from '../footer';
import Header from '../header';
import { Container } from '../ui/container';

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

      {/* Main Content - 自适应高度，确保footer在底部，为底部导航栏留出空间 */}
      <main className="w-full flex-1 pb-16 md:pb-0">
        <Container className="py-8">{children}</Container>
      </main>

      {/* Footer - 始终在底部 */}
      <Footer />

      {/* Bottom Navigation - 仅在移动端显示 */}
      <BottomNavigation />
    </div>
  );
});

MainLayout.displayName = 'MainLayout';
