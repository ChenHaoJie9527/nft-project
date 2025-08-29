import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const footerVariants = cva('border-border border-t bg-background', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type FooterProps = {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof footerVariants>;

export default function Footer({ className }: FooterProps) {
  return (
    <div className={cn(footerVariants({ variant: 'default' }), className)}>
      <div className="container mx-auto max-w-screen-2xl px-4 py-12">
        <div className="grid-clos-1 grid gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary" />
              <span className="font-bold">NFT Gallery</span>
            </div>
            <p className="text-muted-foreground text-sm">
              发现、收集和交易独特的数字艺术作品
            </p>
          </div>

          {/* Links Sections */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">市场</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link className="hover:text-foreground" href="/explore">
                  探索
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/collections">
                  合集
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/trending">
                  热门
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm">创作者</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link className="hover:text-foreground" href="/create">
                  创建NFT
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/dashboard">
                  创作者面板
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/help">
                  帮助文档
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm">社区</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link className="hover:text-foreground" href="/discord">
                  Discord
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/twitter">
                  Twitter
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/blog">
                  博客
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between border-border border-t pt-8 md:flex-row">
            <p className="text-muted-foreground text-sm">
              © 2024 NFT Gallery. 保留所有权利。
            </p>
            <div className="mt-4 flex space-x-6 text-muted-foreground text-sm md:mt-0">
              <Link className="hover:text-foreground" href="/privacy">
                隐私政策
              </Link>
              <Link className="hover:text-foreground" href="/terms">
                服务条款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
