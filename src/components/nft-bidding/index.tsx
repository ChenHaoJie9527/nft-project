'use client';

import { useState } from 'react';
import { addressMap } from '@/constants';
import { useWagmiWallet } from '@/hooks/use-wagmi-wallet';
import { useBidStateMachineStore } from '@/stores/bid-state-machine';
import { Button } from '../ui/button';

export const NftBidding = () => {
  const { start } = useBidStateMachineStore();
  const { accounts, chainId } = useWagmiWallet();
  const [bidPrice] = useState<any>('0.003');
  const [isLoading, setIsLoading] = useState(false);

  const handleBid = () => {
    setIsLoading(true);
    try {
      start({
        chainId,
        accounts,
        collectionAddress: addressMap.nftContractAddress,
        bidPrice,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button disabled={isLoading} onClick={handleBid} type="button">
        {isLoading ? '出价中...' : '出价'}
      </Button>
    </div>
  );
};
