import { ethers } from 'ethers';

export async function getBlockInfo(
  metamaskSDK: any,
  blockNumber: number | null
) {
  if (!(metamaskSDK && blockNumber)) {
    return null;
  }

  try {
    const ethereum = metamaskSDK.getProvider();
    if (!ethereum) {
      return null;
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const block = await provider.getBlock(blockNumber);

    return block;
  } catch (_err) {
    return null;
  }
}
