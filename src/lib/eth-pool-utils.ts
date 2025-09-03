import { getPublicClient } from '@wagmi/core';
import { parseEther } from 'viem';
import type { BuyOrderContext } from '@/configs/buy-order-state-machine-config';
import { wagmiConfig } from '@/configs/wagmi-config';
import { addressMap } from '@/constants';
import { findAbiByContractName } from '@/lib/abi-utils';
import {
  checkContractAvailability,
  createContractConfig,
  readContractData,
  writeContractData,
} from '@/lib/contract-utils';

/**
 * 创建资金池合约配置
 */
export async function createEthPoolContract(chainId: number) {
  const ethPoolAbi = findAbiByContractName('eth-pool');
  if (!ethPoolAbi) {
    throw new Error('无法获取资金池合约ABI');
  }

  const contractConfig = createContractConfig(
    addressMap.ethPoolAddress,
    ethPoolAbi,
    chainId
  );

  // 检查合约是否可用
  const isAvailable = await checkContractAvailability(contractConfig);
  if (!isAvailable) {
    throw new Error('资金池合约不可用');
  }

  return contractConfig;
}

/**
 * 查询用户资金池余额
 */
export async function getUserEthPoolBalance(
  chainId: number,
  userAddress: string
): Promise<bigint> {
  const contractConfig = await createEthPoolContract(chainId);

  const balance = await readContractData(contractConfig, 'balanceOf', [
    userAddress,
  ]);

  if (balance === null || balance === undefined) {
    throw new Error('获取资金池余额失败');
  }

  return balance;
}

/**
 * 充值ETH到资金池
 */
export async function depositToEthPool(
  chainId: number,
  amount: bigint
): Promise<{ hash: string; amount: bigint }> {
  const contractConfig = await createEthPoolContract(chainId);

  const result = await writeContractData(contractConfig, 'deposit', [], amount);

  if (!result?.hash) {
    throw new Error('充值失败，交易哈希为空');
  }

  return {
    hash: result.hash,
    amount,
  };
}

/**
 * 检查余额是否足够
 */
export function checkBalanceSufficient(
  balance: bigint,
  requiredAmount: bigint
): { sufficient: boolean; needsDeposit: boolean; requiredDeposit: bigint } {
  if (balance >= requiredAmount) {
    return {
      sufficient: true,
      needsDeposit: false,
      requiredDeposit: BigInt(0),
    };
  }

  return {
    sufficient: false,
    needsDeposit: true,
    requiredDeposit: requiredAmount - balance,
  };
}

/**
 * 检查用户ETH余额
 */
async function checkEthBalance(
  publicClient: any,
  userAddress: string,
  requiredAmount: bigint
): Promise<{ hasEnough: boolean; balance: bigint }> {
  try {
    const balance = await publicClient.getBalance({
      address: userAddress as `0x${string}`,
    });

    const hasEnough = balance >= requiredAmount;

    return { hasEnough, balance };
  } catch (error) {
    console.error(`获取ETH余额失败: ${error}`);
    return { hasEnough: false, balance: BigInt(0) };
  }
}

/**
 * 检查用户在资金池中的余额
 */
async function checkPoolBalance(
  userAddress: string,
  requiredAmount: bigint,
  chainId: number
): Promise<{ hasEnough: boolean; balance: bigint }> {
  try {
    // 使用现有的工具函数
    const balance = await getUserEthPoolBalance(chainId, userAddress);
    const hasEnough = balance >= requiredAmount;

    return { hasEnough, balance };
  } catch (error) {
    console.warn('检查资金池余额失败:', error);
    return { hasEnough: false, balance: BigInt(0) };
  }
}

/**
 * 检查用户资金（ETH余额或资金池余额）
 */
export async function checkUserFunds(
  context: BuyOrderContext
): Promise<{ hasEnoughFunds: boolean }> {
  const publicClient = getPublicClient(wagmiConfig);
  const requiredAmount = parseEther(context.price);
  const userAddress = context.accounts[0];

  // 1. 检查ETH余额
  const ethCheck = await checkEthBalance(
    publicClient,
    userAddress,
    requiredAmount
  );
  if (ethCheck.hasEnough) {
    return { hasEnoughFunds: true };
  }

  // 2. 检查资金池余额
  const poolCheck = await checkPoolBalance(
    userAddress,
    requiredAmount,
    context.chainId || 0
  );
  if (poolCheck.hasEnough) {
    return { hasEnoughFunds: true };
  }

  // 3. 两种资金都不足
  throw new Error(
    `资金不足，需要 ${context.price} ETH。请确保ETH余额或资金池余额充足。`
  );
}
