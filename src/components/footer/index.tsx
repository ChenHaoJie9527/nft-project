import { Twitter } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        'mx-auto w-full border-border border-t bg-muted/30 md:max-w-[1360px] xl:max-w-[1920px]',
        className
      )}
    >
      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-primary" />
              <span className="font-bold">NFT Gallery</span>
            </div>
            <p className="text-muted-foreground text-sm">
              发现、收集和交易独特的数字艺术作品
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href="/explore"
                >
                  探索
                </a>
              </li>
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href="/collections"
                >
                  合集
                </a>
              </li>
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href="/create"
                >
                  创建
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">支持</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href="/help"
                >
                  帮助中心
                </a>
              </li>
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href="/contact"
                >
                  联系我们
                </a>
              </li>
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href="/terms"
                >
                  服务条款
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">关注我们</h3>
            <div className="flex space-x-4">
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="#"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="#"
              >
                <span className="sr-only">Discord</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  title="Discord"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-border border-t pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 NFT Gallery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
