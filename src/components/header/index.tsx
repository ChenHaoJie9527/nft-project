'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { cn } from '@/lib/utils';
import ActionButton from './action-button';

const headerVariants = cva(
  'sticky top-0 z-50 w-full border-border/90 border-b bg-background/95 backdrop-blur transition-transform duration-300 ease-in-out supports-[backdrop-filter]:bg-background/60',
  {
    variants: {
      variant: {
        default: '',
        transparent: 'border-none bg-transparent',
        solid: 'border-border bg-background',
      },
      hidden: {
        true: '-translate-y-full',
        false: 'translate-y-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      hidden: false,
    },
  }
);

type HeaderProps = {
  className?: string;
  variant?: 'default' | 'transparent' | 'solid';
  scrollThreshold?: number; // 滚动阈值
} & React.HTMLAttributes<HTMLHeadElement> &
  VariantProps<typeof headerVariants>;

export default function Header({
  className,
  variant = 'default',
  scrollThreshold = 20,
}: HeaderProps) {
  const { isVisible } = useScrollHeader({
    threshold: scrollThreshold,
    hideOnScrollDown: true,
    showOnScrollUp: true,
  });

  return (
    <header
      className={cn(headerVariants({ variant, hidden: !isVisible }), className)}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:max-w-[1360px] md:px-6 xl:max-w-[1920px]">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link className="flex items-center space-x-2 lg:mr-6" href="/">
            <div className="h-8 w-8 rounded-md bg-foreground" />
            <span className="hidden font-responsive text-responsive-base lg:inline-block">
              Logo
            </span>
          </Link>
        </div>

        {/* Navigation - 桌面端显示，移动端隐藏 */}
        <nav className="hidden items-center space-x-responsive md:flex">
          <Link
            className="font-responsive text-responsive-sm tracking-responsive"
            href="/explore"
          >
            DiscoGr
          </Link>
          <Link
            className="font-responsive text-responsive-sm tracking-responsive"
            href="/collections"
          >
            My Collections
          </Link>
          <Link
            className="font-responsive text-responsive-sm tracking-responsive"
            href="/how-to-buy"
          >
            How To Buy
          </Link>
          <Link
            className="font-responsive text-responsive-sm tracking-responsive"
            href="/road-map"
          >
            Road Map
          </Link>
          <Link
            className="font-responsive text-responsive-sm tracking-responsive"
            href="/team"
          >
            Team
          </Link>
        </nav>

        <ActionButton />
      </div>
    </header>
  );
}
