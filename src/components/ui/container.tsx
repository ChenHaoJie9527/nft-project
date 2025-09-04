import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 md:w-[90vw] md:px-6 lg:w-[90vw] xl:w-[85vw] 2xl:w-[70vw]', // 固定左右内边距 24px
        className
      )}
    >
      {children}
    </div>
  );
}
