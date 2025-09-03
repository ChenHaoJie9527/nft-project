import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const containerSizes = {
  sm: 'max-w-4xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

export function Container({
  children,
  className = '',
  size = 'xl',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full 3xl:px-16 px-4 md:px-6 lg:px-8 xl:px-12',
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
