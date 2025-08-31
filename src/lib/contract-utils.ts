import type { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import type { ABI } from '@/types';

type ContractConfig = {
  contractAddress: string;
  abi: ABI;
  chainId: number;
};

/**
 * 创建合约实例
 * @param metamaskSDK MetaMask SDK 实例
 * @param contractConfig 合约配置
 * @returns 合约实例
 */
export async function createContractInstance(
  metamaskSDK: MetaMaskSDK,
  contractConfig: ContractConfig
) {
  try {
    const ethereum = metamaskSDK.getProvider();
    if (!ethereum) {
      return null;
    }

    // 创建 ethers provider
    const provider = new ethers.BrowserProvider(ethereum);

    // 获取签名者
    const signer = await provider.getSigner();

    // 创建智能合约实例
    const contract = new ethers.Contract(
      contractConfig.contractAddress,
      contractConfig.abi,
      signer
    );

    return contract;
  } catch (_err) {
    return null;
  }
}
