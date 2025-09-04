'use client';

import {
  Compass,
  FolderOpen,
  HelpCircle,
  Map as MapIcon,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'DiscoGr',
    href: '/explore',
    icon: Compass,
  },
  {
    name: 'My Collections',
    href: '/collections',
    icon: FolderOpen,
  },
  {
    name: 'How To Buy',
    href: '/how-to-buy',
    icon: HelpCircle,
  },
  {
    name: 'Road Map',
    href: '/road-map',
    icon: MapIcon,
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="mx-auto flex h-16 w-full items-center justify-around px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-2 py-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              href={item.href}
              key={item.href}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="font-medium text-xs leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
