import type { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';

export async function getBlockNumber(
  metamaskSDK: MetaMaskSDK
): Promise<number | null> {
  try {
    if (typeof window !== 'undefined' && metamaskSDK) {
      const ethereum = metamaskSDK.getProvider();
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const blockNumber = await provider.getBlockNumber();
        return blockNumber;
      }
      return null;
    }
    return null;
  } catch (_err) {
    return null;
  }
}
