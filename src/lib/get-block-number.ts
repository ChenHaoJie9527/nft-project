import { ethers } from 'ethers';

export async function getBlockNumber(
  //   metamaskSDK: ethers.BrowserProvider
): Promise<number | null> {
  if (typeof window !== 'undefined' && window?.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getBlockNumber();
  }
  return null;
}
