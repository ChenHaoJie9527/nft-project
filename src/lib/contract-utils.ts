import {
  getPublicClient,
  getWalletClient,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from '@wagmi/core';
import type { PublicClient, WalletClient } from 'viem';
import { wagmiConfig } from '@/configs/wagmi-config';
import type { ABI } from '@/types';

type ContractConfig = {
  contractAddress: string;
  abi: any;
  chainId: number;
};

/**
 * 获取 wagmi 的 public client（用于读取合约）
 */
export function getWagmiPublicClient(chainId?: number): PublicClient | null {
  try {
    const publicClient = getPublicClient(wagmiConfig, {
      chainId: chainId as any,
    });
    return publicClient;
  } catch (error) {
    console.error('获取 public client 失败:', error);
    return null;
  }
}

/**
 * 获取 wagmi 的 wallet client（用于签名和写入）
 */
export async function getWagmiWalletClient(
  chainId?: number
): Promise<WalletClient | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig, {
      chainId: chainId as any,
    });
    return walletClient;
  } catch (error) {
    console.error('获取 wallet client 失败:', error);
    return null;
  }
}

/**
 * 读取合约数据 - 使用 wagmi 的 readContract
 */
export async function readContractData(
  contractConfig: ContractConfig,
  functionName: string,
  args: any[] = []
): Promise<any> {
  try {
    const publicClient = getWagmiPublicClient(contractConfig.chainId);
    if (!publicClient) {
      throw new Error('无法获取 public client');
    }

    const result = await readContract(wagmiConfig, {
      address: contractConfig.contractAddress as `0x${string}`,
      abi: contractConfig.abi,
      functionName,
      args,
      chainId: contractConfig.chainId as any,
    });

    return result;
  } catch (error) {
    console.error(`读取合约数据失败 (${functionName}):`, error);
    throw error;
  }
}

/**
 * 写入合约数据 - 使用 wagmi 的 writeContract
 */
export async function writeContractData(
  contractConfig: ContractConfig,
  functionName: string,
  args: any[] = [],
  value?: bigint
): Promise<{ hash: string; receipt: any } | null> {
  try {
    const walletClient = await getWagmiWalletClient(contractConfig.chainId);
    if (!walletClient) {
      throw new Error('无法获取 wallet client，请确保钱包已连接');
    }

    // 执行合约写入
    const hash = await writeContract(wagmiConfig, {
      address: contractConfig.contractAddress as `0x${string}`,
      abi: contractConfig.abi,
      functionName,
      args,
      value,
      chainId: contractConfig.chainId as any,
    });

    // 等待交易确认
    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, receipt };
  } catch (error) {
    console.error(`写入合约数据失败 (${functionName}):`, error);
    return null;
  }
}

/**
 * 检查合约是否可用
 */
export async function checkContractAvailability(
  contractConfig: ContractConfig
): Promise<boolean> {
  try {
    const publicClient = getWagmiPublicClient(contractConfig.chainId);
    if (!publicClient) {
      return false;
    }

    const code = await publicClient.getBytecode({
      address: contractConfig.contractAddress as `0x${string}`,
    });

    return code !== undefined && code !== '0x';
  } catch (error) {
    console.error('检查合约可用性失败:', error);
    return false;
  }
}

/**
 * 获取合约事件
 */
export async function getContractEvents(
  contractConfig: ContractConfig,
  eventName: string,
  fromBlock?: bigint,
  toBlock?: bigint
): Promise<any[]> {
  try {
    const publicClient = getWagmiPublicClient(contractConfig.chainId);
    if (!publicClient) {
      throw new Error('无法获取 public client');
    }

    const logs = await publicClient.getLogs({
      address: contractConfig.contractAddress as `0x${string}`,
      event: {
        type: 'event',
        name: eventName,
        inputs: [], // 这里需要根据具体事件定义
      },
      fromBlock,
      toBlock,
    });

    return logs;
  } catch (error) {
    console.error(`获取合约事件失败 (${eventName}):`, error);
    return [];
  }
}

/**
 * 检查钱包连接状态
 */
export async function checkWalletConnection(chainId?: number): Promise<{
  isConnected: boolean;
  address?: string;
  chainId?: number;
}> {
  const walletClient = await getWagmiWalletClient(chainId);

  if (!walletClient?.account) {
    return { isConnected: false };
  }

  return {
    isConnected: true,
    address: walletClient.account.address,
    chainId: walletClient.chain?.id,
  };
}

/**
 * 获取当前网络信息
 */
export async function getCurrentNetwork(chainId?: number): Promise<{
  chainId: number;
} | null> {
  try {
    const publicClient = getWagmiPublicClient(chainId);
    if (!publicClient) {
      return null;
    }

    // const block = await publicClient.getBlock();
    const chain = await publicClient.getChainId();

    return {
      chainId: Number(chain),
    };
  } catch (error) {
    console.error('获取网络信息失败:', error);
    return null;
  }
}

/**
 * 创建合约配置对象
 */
export function createContractConfig(
  contractAddress: string,
  abi: any,
  chainId: number
): ContractConfig {
  return {
    contractAddress,
    abi,
    chainId,
  };
}
