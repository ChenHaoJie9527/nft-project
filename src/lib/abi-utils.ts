// 直接导入ABI文件
import erc721Abi from '@/abis/721.json' with { type: 'json' };
import ethPoolAbi from '@/abis/eth-pool.json' with { type: 'json' };
import nftOrderManagerAbi from '@/abis/nft-order-manager.json' with {
  type: 'json',
};

// ABI映射表
const ABI_MAP = {
  '721': erc721Abi,
  'nft-order-manager': nftOrderManagerAbi,
  'eth-pool': ethPoolAbi,
} as const;

// 从ABI_MAP中提取键值类型
export type ContractName = keyof typeof ABI_MAP;

// 从ABI_MAP中提取值类型
export type Abi = (typeof ABI_MAP)[ContractName];

/**
 * 根据合约名称获取ABI
 * @param contractName 合约名称
 * @returns ABI数组，如果找不到则返回null
 */
export function findAbiByContractName(contractName: ContractName): Abi | null {
  return ABI_MAP[contractName] || null;
}

/**
 * 获取所有可用的合约名称
 * @returns 合约名称数组
 */
export function getAvailableContractNames(): ContractName[] {
  return Object.keys(ABI_MAP) as ContractName[];
}

/**
 * 检查指定的合约ABI是否存在
 * @param contractName 合约名称
 * @returns 是否存在
 */
export function hasAbi(contractName: ContractName): boolean {
  return contractName in ABI_MAP;
}

/**
 * 获取ABI映射表
 * @returns ABI映射表
 */
export function getAbiMap() {
  return ABI_MAP;
}
