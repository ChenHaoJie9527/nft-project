'use client';

import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { wagmiConfig } from '@/configs/wagmi-config';
import { addressMap } from '@/constants';
import { useClient } from '@/hooks/use-client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useWagmiWallet } from '@/hooks/use-wagmi-wallet';
import { findAbiByContractName } from '@/lib/abi-utils';
import { formatAddress } from '@/lib/format-address';
import { formatBigInt } from '@/lib/format-bigint';
import { formatTimestamp } from '@/lib/format-timestamp';
import { safeStringify } from '@/lib/safe-stringify-bigint';
import { getChainName } from '@/lib/signature-utils';
import { useBuyOrderStateMachineStore } from '@/stores/buy-order-state-machine';
import { useOrderStateMachineStore } from '@/stores/order-state-machine';
import { Button } from '../ui/button';

export default function EIP712Signature() {
  const { accounts, chainId, loading, error } = useWagmiWallet();
  const [price] = useState('0.0001');
  const [orderData, setOrderData] = useLocalStorage<any>('sell-order', {});
  const [buyOrderData, setBuyOrderData] = useLocalStorage<any>('buy-order', {});
  const { context, start } = useOrderStateMachineStore();
  const { context: buyContext, start: startBuyOrder } =
    useBuyOrderStateMachineStore();
  // 添加本地状态管理
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const isClient = useClient();

  useEffect(() => {
    if (context.orderData) {
      setOrderData(context.orderData);
    }
  }, [context.orderData]);

  useEffect(() => {
    if (buyContext.orderData) {
      setBuyOrderData(buyContext.orderData);
    }
  }, [buyContext.orderData]);

  const handleEIP712Sign = async () => {
    try {
      setLocalLoading(true);
      // 启动状态机 - 移除 metamaskSDK 参数
      await start({
        chainId,
        accounts,
        price,
      });
    } catch (err) {
      console.error('挂单失败:', err);
      setLocalError(err as string);
    } finally {
      setLocalLoading(false);
    }
  };

  // 1. 修复买单创建 - onBuyClick 函数
  const onBuyClick = async () => {
    try {
      setBuyLoading(true);
      await startBuyOrder({
        chainId,
        accounts,
        price,
      });
    } catch (_err) {
      console.error('买单失败:', _err);
      setBuyError(_err as string);
    } finally {
      setBuyLoading(false);
    }
  };

  const onMatchClick = async () => {
    console.log('onMatchClick');

    if (!chainId) {
      console.error('请先选择网络');
      return;
    }
    console.log('orderData', orderData);
    console.log('buyOrderData', buyOrderData);

    if (
      !(orderData && buyOrderData) ||
      Object.keys(orderData).length === 0 ||
      Object.keys(buyOrderData).length === 0
    ) {
      // 检查是否有完整的订单数据
      console.error('请先创建卖单和买单');
      return;
    }

    try {
      // 使用 wagmi 的方式执行合约调用
      const nftOrderAbi = findAbiByContractName('nft-order-manager');

      if (!nftOrderAbi) {
        throw new Error('无法获取合约 ABI');
      }

      // 准备合约调用参数
      const sellInput = {
        order: orderData.order,
        v: orderData.v,
        r: orderData.r,
        s: orderData.s,
        extraSignature: orderData.extraSignature,
        signatureVersion: orderData.signatureVersion,
        blockNumber: orderData.blockNumber,
      };

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

      // 使用 wagmi 的 writeContract 执行交易
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
    } catch (err) {
      console.error('发起撮合交易失败:', err);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <p>签名演示</p>

      {/* 显示当前链ID */}
      {isClient && chainId && (
        <div className="mb-4 text-sm text-white">
          当前网络: {getChainName(chainId)} ({chainId})
        </div>
      )}

      <div className="flex gap-1">
        <div className="flex flex-1 flex-col items-center rounded-md border border-gray-200 p-2">
          <Button
            className="w-1/2"
            disabled={loading || localLoading}
            onClick={handleEIP712Sign}
          >
            {loading || localLoading ? '挂单中...' : '挂单'}
          </Button>
          {localError && (
            <div className="mt-2 text-red-500 text-sm">{localError}</div>
          )}
          <div className="mt-2 w-full text-sm">
            <p className="font-semibold">挂单结果:</p>
            <div className="flex flex-col gap-2 break-all rounded bg-gray-100 p-2 text-black text-sm">
              {orderData && Object.keys(orderData).length > 0 ? (
                <div className="space-y-3">
                  {/* 签名信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-blue-600">签名信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">V:</span> {orderData?.v}
                      </div>
                      <div>
                        <span className="font-medium">R:</span>{' '}
                        {formatAddress(orderData?.r || '')}
                      </div>
                      <div>
                        <span className="font-medium">S:</span>{' '}
                        {formatAddress(orderData?.s || '')}
                      </div>
                      <div>
                        <span className="font-medium">区块号:</span>{' '}
                        {orderData.blockNumber}
                      </div>
                      <div>
                        <span className="font-medium">签名版本:</span>{' '}
                        {orderData.signatureVersion}
                      </div>
                    </div>
                  </div>

                  {/* 订单基本信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-green-600">订单信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">Nonce:</span>{' '}
                        {orderData.order?.nonce}
                      </div>
                      <div>
                        <span className="font-medium">交易者:</span>{' '}
                        {formatAddress(orderData.order?.trader || '')}
                      </div>
                      <div>
                        <span className="font-medium">订单方向:</span>{' '}
                        {orderData.order?.side === 0 ? '卖出' : '买入'}
                      </div>
                      <div>
                        <span className="font-medium">匹配策略:</span>{' '}
                        {formatAddress(orderData.order?.matchingPolicy || '')}
                      </div>
                    </div>
                  </div>

                  {/* NFT 信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-purple-600">NFT 信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">NFT 合约:</span>{' '}
                        {formatAddress(orderData.order?.nftContract || '')}
                      </div>
                      <div>
                        <span className="font-medium">Token ID:</span>{' '}
                        {orderData.order?.tokenId?.toString()}
                      </div>
                      <div>
                        <span className="font-medium">资产类型:</span>{' '}
                        {orderData.order?.AssetType === 0
                          ? 'ERC721'
                          : 'ERC1155'}
                      </div>
                      <div>
                        <span className="font-medium">数量:</span>{' '}
                        {orderData.order?.amount?.toString()}
                      </div>
                    </div>
                  </div>

                  {/* 价格信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-orange-600">价格信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">支付代币:</span>{' '}
                        {formatAddress(orderData.order?.paymentToken || '')}
                      </div>
                      <div>
                        <span className="font-medium">价格 (Wei):</span>{' '}
                        {orderData.order?.price?.toString()}
                      </div>
                      <div>
                        <span className="font-medium">价格 (ETH):</span>{' '}
                        {formatBigInt(orderData.order?.price || 0)} ETH
                      </div>
                    </div>
                  </div>

                  {/* 时间信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-red-600">时间信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">创建时间:</span>{' '}
                        {formatTimestamp(orderData.order?.createAT || 0)}
                      </div>
                      <div>
                        <span className="font-medium">有效期至:</span>{' '}
                        {formatTimestamp(orderData.order?.validUntil || 0)}
                      </div>
                    </div>
                  </div>

                  {/* 其他信息 */}
                  <div>
                    <h4 className="mb-2 font-bold text-gray-600">其他信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">手续费:</span>{' '}
                        {orderData.order?.fees?.length || 0} 项
                      </div>
                      <div>
                        <span className="font-medium">额外参数:</span>{' '}
                        {orderData.order?.extraParams || '0x'}
                      </div>
                    </div>
                  </div>

                  {/* 原始数据 (可折叠) */}
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                      查看原始数据
                    </summary>
                    <pre className="mt-2 rounded bg-gray-200 p-2 text-xs">
                      {safeStringify(orderData, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  暂无挂单数据，请先执行挂单操作
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-md border border-gray-200 p-2">
          <Button
            className="w-1/2"
            disabled={loading || buyLoading}
            onClick={onBuyClick}
          >
            {buyLoading ? '买单中...' : '买单'}
          </Button>
          {buyError && (
            <div className="mt-2 text-red-500 text-sm">{buyError}</div>
          )}
          <div className="mt-2 w-full text-sm">
            <p className="font-semibold">买单结果:</p>
            <div className="flex flex-col gap-2 break-all rounded bg-gray-100 p-2 text-black text-sm">
              {buyOrderData && Object.keys(buyOrderData).length > 0 ? (
                <div className="space-y-3">
                  {/* 签名信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-blue-600">签名信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">V:</span>{' '}
                        {buyOrderData?.v}
                      </div>
                      <div>
                        <span className="font-medium">R:</span>{' '}
                        {formatAddress(buyOrderData?.r || '')}
                      </div>
                      <div>
                        <span className="font-medium">S:</span>{' '}
                        {formatAddress(buyOrderData?.s || '')}
                      </div>
                      <div>
                        <span className="font-medium">区块号:</span>{' '}
                        {buyOrderData.blockNumber}
                      </div>
                      <div>
                        <span className="font-medium">签名版本:</span>{' '}
                        {buyOrderData.signatureVersion}
                      </div>
                    </div>
                  </div>

                  {/* 订单基本信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-green-600">订单信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">Nonce:</span>{' '}
                        {buyOrderData.order?.nonce}
                      </div>
                      <div>
                        <span className="font-medium">交易者:</span>{' '}
                        {formatAddress(buyOrderData.order?.trader || '')}
                      </div>
                      <div>
                        <span className="font-medium">订单方向:</span>{' '}
                        {buyOrderData.order?.side === 0 ? '卖出' : '买入'}
                      </div>
                      <div>
                        <span className="font-medium">匹配策略:</span>{' '}
                        {formatAddress(
                          buyOrderData.order?.matchingPolicy || ''
                        )}
                      </div>
                    </div>
                  </div>

                  {/* NFT 信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-purple-600">NFT 信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">NFT 合约:</span>{' '}
                        {formatAddress(buyOrderData.order?.nftContract || '')}
                      </div>
                      <div>
                        <span className="font-medium">Token ID:</span>{' '}
                        {buyOrderData.order?.tokenId?.toString()}
                      </div>
                      <div>
                        <span className="font-medium">资产类型:</span>{' '}
                        {buyOrderData.order?.AssetType === 0
                          ? 'ERC721'
                          : 'ERC1155'}
                      </div>
                      <div>
                        <span className="font-medium">数量:</span>{' '}
                        {buyOrderData.order?.amount?.toString()}
                      </div>
                    </div>
                  </div>

                  {/* 价格信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-orange-600">价格信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">支付代币:</span>{' '}
                        {formatAddress(buyOrderData.order?.paymentToken || '')}
                      </div>
                      <div>
                        <span className="font-medium">价格 (Wei):</span>{' '}
                        {buyOrderData.order?.price?.toString()}
                      </div>
                      <div>
                        <span className="font-medium">价格 (ETH):</span>{' '}
                        {formatBigInt(buyOrderData.order?.price || 0)} ETH
                      </div>
                    </div>
                  </div>

                  {/* 时间信息 */}
                  <div className="border-gray-300 border-b pb-2">
                    <h4 className="mb-2 font-bold text-red-600">时间信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">创建时间:</span>{' '}
                        {formatTimestamp(buyOrderData.order?.createAT || 0)}
                      </div>
                      <div>
                        <span className="font-medium">有效期至:</span>{' '}
                        {formatTimestamp(buyOrderData.order?.validUntil || 0)}
                      </div>
                    </div>
                  </div>

                  {/* 其他信息 */}
                  <div>
                    <h4 className="mb-2 font-bold text-gray-600">其他信息</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="font-medium">手续费:</span>{' '}
                        {buyOrderData.order?.fees?.length || 0} 项
                      </div>
                      <div>
                        <span className="font-medium">额外参数:</span>{' '}
                        {buyOrderData.order?.extraParams || '0x'}
                      </div>
                    </div>
                  </div>

                  {/* 原始数据 (可折叠) */}
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                      查看原始数据
                    </summary>
                    <pre className="mt-2 rounded bg-gray-200 p-2 text-xs">
                      {safeStringify(buyOrderData, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  暂无买单数据，请先执行挂单操作
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button onClick={onMatchClick}>撮合交易</Button>
      {error && (
        <div className="text-red-500 text-sm">错误: {error.message}</div>
      )}
    </div>
  );
}
