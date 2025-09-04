'use client';

import { Globe, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import WalletConnectButton from '../wallet-connect-button';

export default function ActionButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center space-x-3">
      {/* 钱包连接按钮 */}
      <WalletConnectButton />

      {/* 功能图标 - 桌面端 */}
      <div className="hidden items-center space-x-2 md:flex">
        <button
          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
          type="button"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
          type="button"
        >
          <Globe className="h-5 w-5" />
        </button>
      </div>

      {/* 移动端汉堡菜单 */}
      {/* <button
        className="p-2 md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        type="button"
      >
        <Menu className="h-6 w-6" />
      </button> */}

      {/* 移动端菜单 - 全屏覆盖 */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur md:hidden">
          <div className="mx-auto flex h-full max-w-6xl flex-col px-6">
            {/* 导航链接 */}
            <div className="flex-1 space-y-1 p-6">
              <Link
                className="block py-3 font-medium text-foreground/80 text-lg transition-colors hover:text-foreground"
                href="/explore"
                onClick={() => setIsMenuOpen(false)}
              >
                探索
              </Link>
              <Link
                className="block py-3 font-medium text-foreground/80 text-lg transition-colors hover:text-foreground"
                href="/collections"
                onClick={() => setIsMenuOpen(false)}
              >
                合集
              </Link>
              <Link
                className="block py-3 font-medium text-foreground/80 text-lg transition-colors hover:text-foreground"
                href="/create"
                onClick={() => setIsMenuOpen(false)}
              >
                创建
              </Link>
            </div>

            {/* 底部操作区 */}
            <div className="border-border border-t p-6">
              <Button className="w-full" variant="outline">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
