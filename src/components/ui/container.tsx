import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | 'standard';
}

const containerSizes = {
  sm: 'max-w-4xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-8xl',
  '3xl': 'max-w-9xl',
  full: 'max-w-none',
  // 标准宽度：1360px
  standard: 'max-w-[1360px]',
};

export function Container({
  children,
  className = '',
  size = 'standard', // 默认使用 1360px
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6', // 固定左右内边距 24px
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
