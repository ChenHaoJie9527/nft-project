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
