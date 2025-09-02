'use client';

import { useState } from 'react';
import { addressMap } from '@/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useWagmiWallet } from '@/hooks/use-wagmi-wallet';
import { findAbiByContractName } from '@/lib/abi-utils';
import { createContractConfig, writeContractData } from '@/lib/contract-utils';
import { Button } from '../ui/button';

export const CancelOrder = () => {
  const { accounts, chainId } = useWagmiWallet();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cellOrderData, setCellOrderData] = useLocalStorage<any>(
    'sell-order',
    {}
  );

  const handleCancelOrder = async () => {
    console.log('handleCancelOrder');
    if (!(accounts?.[0] && chainId)) {
      console.error('钱包未连接或网络未选择');
      return;
    }

    if (!cellOrderData || Object.keys(cellOrderData).length === 0) {
      console.error('请先创建订单');
      return;
    }

    const order = cellOrderData?.order;

    try {
      setIsCancelling(true);
      const abi = findAbiByContractName('nft-order-manager');
      if (!abi) {
        throw new Error('无法获取合约ABI');
      }

      const contractConfig = createContractConfig(
        addressMap.contractAddress,
        abi,
        chainId
      );

      const result = await writeContractData(contractConfig, 'cancelOrder', [
        order,
      ]);

      if (result) {
        console.log('取消订单成功:', result);
        setCellOrderData({});
      } else {
        console.error('取消订单失败');
      }
    } catch (_err) {
      console.error('取消订单失败:', _err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      <Button disabled={isCancelling} onClick={handleCancelOrder} type="button">
        {isCancelling ? '取消中...' : '取消订单'}
      </Button>
    </div>
  );
};
