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
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type HeaderProps = {
  className?: string;
} & React.HTMLAttributes<HTMLHeadElement> &
  VariantProps<typeof headerVariants>;

export default function Header({ className }: HeaderProps) {
  return (
    <div className={cn(headerVariants({ variant: 'default' }), className)}>
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
        {/* Logo/Brand */}
        <div className="mr-4 flex">
          <a className="mr-4 flex items-center space-x-2 lg:mr-6" href="/">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="hidden font-bold lg:inline-block">
              NFT Gallery
            </span>
          </a>
        </div>
        {/* Navigation */}
        <nav className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="hidden w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center space-x-6 text-sm">
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/explore"
              >
                探索
              </Link>
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/collections"
              >
                合集
              </Link>
              <Link
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                href="/create"
              >
                创建
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <ActionButton />
        </nav>
      </div>
    </div>
  );
}
