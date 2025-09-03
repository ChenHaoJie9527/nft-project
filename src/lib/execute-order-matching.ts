// ... existing imports ...

import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { wagmiConfig } from '@/configs/wagmi-config';
import { addressMap } from '@/constants';
import { findAbiByContractName } from './abi-utils';

/**
 * 执行NFT订单撮合交易
 */
export async function executeOrderMatching(
  sellOrderData: any,
  buyOrderData: any,
  _chainId?: number
): Promise<{ transactionHash: string; transactionStatus: 'confirmed' }> {
  // 获取合约ABI
  const nftOrderAbi = findAbiByContractName('nft-order-manager');
  if (!nftOrderAbi) {
    throw new Error('找不到合约ABI');
  }

  // 准备挂单输入
  const sellInput = {
    order: sellOrderData.order,
    v: sellOrderData.v,
    r: sellOrderData.r,
    s: sellOrderData.s,
    extraSignature: sellOrderData.extraSignature,
    signatureVersion: sellOrderData.signatureVersion,
    blockNumber: sellOrderData.blockNumber,
  };

  // 准备买单输入
  const buyInput = {
    order: buyOrderData.order,
    v: buyOrderData.v,
    r: buyOrderData.r,
    s: buyOrderData.s,
    extraSignature: buyOrderData.extraSignature,
    signatureVersion: buyOrderData.signatureVersion,
    blockNumber: buyOrderData.blockNumber,
  };

  // 买单需要发送ETH
  const buyPrice = buyOrderData.order.price;

  // 执行撮合交易
  const executeTx = await writeContract(wagmiConfig, {
    address: addressMap.contractAddress as `0x${string}`,
    abi: nftOrderAbi,
    functionName: 'execute',
    args: [sellInput, buyInput],
    value: BigInt(buyPrice),
  });

  console.log('撮合交易已发送:', executeTx);

  // 等待交易确认
  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash: executeTx,
  });
  console.log('撮合交易成功', receipt);

  if (receipt.status === 'reverted') {
    throw new Error('撮合交易失败');
  }

  return {
    transactionHash: executeTx,
    transactionStatus: 'confirmed' as const,
  };
}
