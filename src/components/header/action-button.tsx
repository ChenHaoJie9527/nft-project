'use client';

import { Globe, Search } from 'lucide-react';
import WalletConnectButton from '../wallet-connect-button';

export default function ActionButton() {
  return (
    <div className="flex items-center space-x-responsive">
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
    </div>
  );
}
