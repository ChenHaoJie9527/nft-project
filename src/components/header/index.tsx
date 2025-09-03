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
      <div className="mx-auto flex h-16 w-full items-center justify-between px-6 md:max-w-[1360px] xl:max-w-[1920px]">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link className="flex items-center space-x-2 lg:mr-6" href="/">
            <div className="h-8 w-8 rounded-md bg-foreground" />
            <span className="hidden font-responsive text-responsive-base lg:inline-block">
              Logo
            </span>
          </Link>
        </div>

        {/* Navigation - 桌面端 */}
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
