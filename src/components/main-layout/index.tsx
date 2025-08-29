import { cn } from '@/lib/utils';
import Footer from '../footer';
import Header from '../header';

type MainLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
