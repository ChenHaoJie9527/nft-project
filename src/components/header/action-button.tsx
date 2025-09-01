'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClientEffect } from '@/hooks/use-client-effect';
import WalletConnectButton from '../wallet-connect-button';

export default function ActionButton() {
  const [mounted, setMounted] = useState(false);

  useClientEffect(() => {
    setMounted(true);
  }, []);

  // 在客户端挂载之前显示默认状态，避免hydration不匹配
  if (!mounted) {
    return (
      <div className="flex w-full items-center justify-end space-x-2">
        <Button className="" size="sm" variant="ghost">
          菜单
        </Button>
        <Button disabled={true} size="sm" variant="outline">
          连接钱包
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-end space-x-2">
      <Button className="" size="sm" variant="ghost">
        菜单
      </Button>
      <WalletConnectButton />
    </div>
  );
}
