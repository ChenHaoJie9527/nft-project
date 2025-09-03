import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function Hero({ children, className = '' }: TypographyProps) {
  return (
    <h1
      className={cn(
        'font-bold text-foreground text-hero leading-tight',
        className
      )}
    >
      {children}
    </h1>
  );
}

export function Title({ children, className = '' }: TypographyProps) {
  return (
    <h2
      className={cn(
        'font-bold text-foreground text-title leading-tight',
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Subtitle({ children, className = '' }: TypographyProps) {
  return (
    <h3
      className={cn(
        'font-semibold text-foreground text-subtitle leading-snug',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function Body({ children, className = '' }: TypographyProps) {
  return (
    <p
      className={cn(
        'text-body text-muted-foreground leading-relaxed',
        className
      )}
    >
      {children}
    </p>
  );
}
