import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/configs/wagmi-config';
import { addressMap } from '@/constants';
import { findAbiByContractName } from '@/lib/abi-utils';

export async function getNftOrderNonce(
  chainId: number,
  accounts: string[]
): Promise<number | null> {
  if (!(chainId && accounts) || accounts.length === 0) {
    return null;
  }

  try {
    // 获取 ABI
    const nftOrder = findAbiByContractName('nft-order-manager');
    if (!nftOrder) {
      throw new Error('无法获取合约 ABI');
    }

    // 首先尝试 getNonce 方法
    try {
      const nonce = await readContract(wagmiConfig, {
        address: addressMap.contractAddress as `0x${string}`,
        abi: nftOrder,
        functionName: 'getNonce',
        chainId: chainId as 1 | 11155111,
      });

      return nonce as number | null;
    } catch (_getNonceError) {
      return null;
    }
  } catch (_err) {
    return null;
  }
}
