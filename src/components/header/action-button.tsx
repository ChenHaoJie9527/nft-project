'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClientEffect } from '@/hooks/use-client-effect';
import { useMetamask } from '@/hooks/use-metamask';

export default function ActionButton() {
  const { connect, disconnect, loading, isConnected } = useMetamask();
  const [mounted, setMounted] = useState(false);

  useClientEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletAction = async () => {
    if (isConnected()) {
      await disconnect();
    } else {
      await connect();
    }
  };

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
      <Button
        disabled={loading}
        onClick={handleWalletAction}
        size="sm"
        variant="outline"
      >
        {isConnected() ? '断开连接' : '连接钱包'}
      </Button>
    </div>
  );
}
