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
        'mx-auto w-full px-6 md:max-w-[1360px] xl:max-w-[1920px]',
        className
      )}
    >
      {children}
    </div>
  );
}
