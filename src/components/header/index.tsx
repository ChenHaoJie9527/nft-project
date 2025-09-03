import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ActionButton from './action-button';

const headerVariants = cva(
  'sticky top-0 z-50 w-full border-border/90 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  {
    variants: {
      variant: {
        default: '',
        transparent: 'border-none bg-transparent',
        solid: 'border-border bg-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type HeaderProps = {
  className?: string;
  variant?: 'default' | 'transparent' | 'solid';
} & React.HTMLAttributes<HTMLHeadElement> &
  VariantProps<typeof headerVariants>;

export default function Header({
  className,
  variant = 'default',
}: HeaderProps) {
  return (
    <header className={cn(headerVariants({ variant }), className)}>
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between px-6">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <a className="flex items-center space-x-2 lg:mr-6" href="/">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="hidden font-bold lg:inline-block">
              NFT Gallery
            </span>
          </a>
        </div>

        {/* Navigation - 桌面端 */}
        <nav className="hidden items-center space-x-8 md:flex">
          <Link
            className="text-foreground/60 text-sm transition-colors hover:text-foreground/80"
            href="/explore"
          >
            探索
          </Link>
          <Link
            className="text-foreground/60 text-sm transition-colors hover:text-foreground/80"
            href="/collections"
          >
            合集
          </Link>
          <Link
            className="text-foreground/60 text-sm transition-colors hover:text-foreground/80"
            href="/create"
          >
            创建
          </Link>
        </nav>

        {/* Action Buttons */}
        <ActionButton />
      </div>
    </header>
  );
}
