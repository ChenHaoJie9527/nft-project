'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientEffect } from '@/hooks/use-client-effect';
import { useMetamask } from '@/hooks/use-metamask';

export default function WalletInfo() {
  const { accounts, truncateAddress, isConnected } = useMetamask();
  const [mounted, setMounted] = useState(false);

  useClientEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>钱包信息</CardTitle>
        </CardHeader>
        <CardContent>
          <p>钱包地址：</p>
          <p>连接状态：</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>钱包信息</CardTitle>
      </CardHeader>
      <CardContent>
        <p>钱包地址：{truncateAddress(accounts[0])}</p>
        <p>连接状态：{isConnected() ? '已连接' : '未连接'}</p>
      </CardContent>
    </Card>
  );
}
