'use client';

import { type Contract, ethers } from 'ethers';
import { useState } from 'react';
import {
  addressMap,
  assetTypeMap,
  matchingPolicyMap,
  orderSideMap,
} from '@/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMetamask } from '@/hooks/use-metamask';
import { findAbiByContractName } from '@/lib/abi-utils';
import { assertAbi } from '@/lib/assert-abi';
import { createContractInstance } from '@/lib/contract-utils';
import { createEIP712Message } from '@/lib/eip712-utils';
import { formatAddress } from '@/lib/format-address';
import { formatBigInt } from '@/lib/format-bigint';
import { formatTimestamp } from '@/lib/format-timestamp';
import { safeStringify } from '@/lib/safe-stringify-bigint';
import { getChainName } from '@/lib/signature-utils';
import type { SendParams } from '@/types';
import { Button } from '../ui/button';

export default function EIP712Signature() {
  const {
    signEIP712,
    isConnected,
    accounts,
    chainId,
    loading,
    error,
    metamaskSDK,
  } = useMetamask();
  const [price] = useState('0.0001');
  const [orderData, setOrderData] = useLocalStorage<any>('sell-order', {});
  const [buyOrderData, setBuyOrderData] = useLocalStorage<any>('buy-order', {});

  // 添加本地状态管理
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const handleEIP712Sign = async () => {
    setLocalError(null);
    setLocalLoading(true);

    // 检查是否连接钱包
    if (!isConnected()) {
      setLocalError('请先连接钱包');
      setLocalLoading(false);
      return;
    }

    // 检查是否选择网络
    if (!chainId) {
      setLocalError('请先选择网络');
      setLocalLoading(false);
      return;
    }

    // 检查是否初始化MetaMask SDK
    if (!metamaskSDK) {
      setLocalError('MetaMask SDK not available');
      setLocalLoading(false);
      return;
    }

    try {
      // 获取区块号
      const blockNumber = await getBlockNumber();
      // 通过区块号获取区块信息
      const blockInfo = await getBlockInfo(blockNumber);
      // 计算时间
      const chainTime = BigInt(
        blockInfo?.timestamp ?? Math.floor(Date.now() / 1000)
      );
      // 计算有效期
      const validUntil = chainTime + BigInt(3600);
      // 计算创建时间
      const createAT = chainTime;
      // 计算价格
      const ethPrice = ethers.parseEther(price);

      // 获取合约nonce，确保签名和执行的nonce一致
      const nftOrderAbi = findAbiByContractName('nft-order-manager');
      console.log('获取到的ABI:', nftOrderAbi);
      console.log('合约地址:', addressMap.contractAddress);
      console.log('链ID:', chainId);

      // 创建合约实例
      const nftOrderContract = await createContractInstance(metamaskSDK, {
        chainId,
        abi: assertAbi(nftOrderAbi),
        contractAddress: addressMap.contractAddress,
      });

      console.log('合约实例创建成功:', Boolean(nftOrderContract));

      const nonce = await getNftOrderNonce(nftOrderContract);
      if (nonce === null || nonce === undefined) {
        setLocalError('获取nonce失败 - 请检查合约地址和网络连接');
        setLocalLoading(false);
        return;
      }

      console.log('成功获取nonce:', nonce);

      // 创建EIP712消息，使用合约nonce
      const typedData = createEIP712Message.nftMint({
        chainId,
        contractAddress: addressMap.contractAddress,
        order: {
          to: accounts[0] as `0x${string}`,
          tokenId: 10,
          nonce: Number(nonce), // 使用合约nonce，不是Date.now()
          side: 0,
          matchingPolicy: matchingPolicyMap.default,
          nftContract: addressMap.nftContractAddress,
          price: ethPrice.toString(),
          validUntil: validUntil.toString(),
          createAT: createAT.toString(),
          fees: [],
          extraParams: '0x',
        },
      });

      console.log('卖单EIP712消息:', typedData);
      console.log('使用的nonce:', nonce);

      // 解析处 v s r
      const signature = await signEIP712(typedData);

      if (metamaskSDK) {
        // 获取当前区块号
        // const blockNumber = await getBlockNumber(); // This line is now redundant

        // 创建合约实例
        const erc721Abi = findAbiByContractName('721');
        const contract = await createContractInstance(metamaskSDK, {
          contractAddress: addressMap.nftContractAddress, // TODO: nft合约地址，后续动态获取
          abi: assertAbi(erc721Abi),
          chainId,
        });

        const receiptResult = await sendApprove(contract);

        if (receiptResult && signature) {
          // 订单方向
          const side = orderSideMap.Sell;

          // 后端返回的nft列表里的每个nft对应的tokenId，1是伪代码
          const nftTokenId = BigInt(10);

          // 匹配策略地址: 后续会有多个策略，根据不同的场景去使用
          const matchingPolicy = matchingPolicyMap.default;

          // nft合约地址
          const nftContract = addressMap.nftContractAddress;

          // 资产类型
          const assetType = assetTypeMap.ERC721;

          // 订单数量
          const amount = BigInt(1);

          // 支付token地址
          const paymentToken = ethers.ZeroAddress;

          const sendParams = createSendParams({
            vrs: signature,
            blockNumber: blockNumber ?? 0,
            signatureVersion: 0, // Single: 单笔交易(0), Batch: 批量交易(1)
            extraSignature: '0x',
            order: {
              nonce, // 使用之前获取的nonce
              trader: accounts[0] as `0x${string}`,
              side,
              matchingPolicy,
              nftContract,
              tokenId: nftTokenId,
              AssetType: assetType,
              amount,
              paymentToken,
              price: ethPrice,
              validUntil,
              createAT,
              fees: [],
              extraParams: '0x',
            },
          });
          console.log('sendParams:', sendParams);
          setOrderData(sendParams);
          setLocalLoading(false);
        }
      }
    } catch (err) {
      console.error('EIP712签名失败:', err);
      setLocalError(
        `EIP712签名失败: ${err instanceof Error ? err.message : '未知错误'}`
      );
      setLocalLoading(false);
    }
  };

  async function getBlockInfo(blockNumber: number | null) {
    if (!metamaskSDK) {
      console.error('MetaMask SDK not available');
      return null;
    }

    if (!blockNumber) {
      return null;
    }

    try {
      // 获取 ethereum provider
      const ethereum = metamaskSDK.getProvider();

      if (!ethereum) {
        throw new Error('Ethereum provider not available');
      }

      // 创建 ethers provider
      const provider = new ethers.BrowserProvider(ethereum);

      // 通过区块号获取区块信息
      const block = await provider.getBlock(blockNumber);

      if (block) {
        return block;
      }
      return null;
    } catch (_err) {
      return null;
    }
  }

  async function getBlockNumber() {
    if (typeof window !== 'undefined' && window?.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const blockNumber = await provider.getBlockNumber();
      return blockNumber;
    }
    return null;
  }

  // 构建挂单数据
  function createSendParams({
    vrs,
    order,
    blockNumber,
    signatureVersion = 0,
    extraSignature = '0x',
  }: SendParams) {
    const params = {
      order,
      v: vrs.v,
      r: vrs.r,
      s: vrs.s,
      blockNumber,
      signatureVersion,
      extraSignature,
    };

    return params;
  }

  // 获取nft订单合约nonce值
  async function getNftOrderNonce(contract: Contract | null | undefined) {
    if (!contract) {
      console.error('合约实例为空，无法获取nonce');
      return null;
    }

    try {
      console.log('正在获取nonce，合约地址:', contract.target);

      // 首先尝试getNonce方法
      try {
        const nonce = await contract.getNonce();
        console.log('通过getNonce获取成功:', nonce);
        return nonce;
      } catch (getNonceError) {
        console.warn('getNonce方法失败，尝试从nonces映射获取:', getNonceError);

        // 备用方案：从nonces映射获取当前用户的nonce
        if (accounts?.[0]) {
          const userNonce = await contract.nonces(accounts[0]);
          console.log('通过nonces映射获取成功:', userNonce);
          return userNonce;
        }

        console.error('无法获取用户地址');
        return null;
      }
    } catch (err) {
      console.error('获取nonce失败，详细错误:', err);
      console.error(
        '错误消息:',
        err instanceof Error ? err.message : '未知错误'
      );
      return null;
    }
  }

  // 发送Approve授权交易
  async function sendApprove(contract?: Contract | null) {
    try {
      if (contract) {
        const toAddress = addressMap.approveAddress;
        const tokenId = 10;
        console.log('正在授权NFT给合约:', toAddress);
        const tx = await contract.approve(toAddress, tokenId);
        console.log('授权交易已发送:', tx.hash);
        const receipt = await tx.wait();
        console.log('授权交易确认:', receipt);
        return receipt;
      }
    } catch (err) {
      console.log('approve调用失败', err);
      return null;
    }
  }

  // 1. 修复买单创建 - onBuyClick 函数
  const onBuyClick = async () => {
    setBuyError(null);
    setBuyLoading(true);

    if (!isConnected()) {
      setBuyError('请先连接钱包');
      setBuyLoading(false);
      return;
    }

    if (!chainId) {
      setBuyError('请先选择网络');
      setBuyLoading(false);
      return;
    }

    if (!metamaskSDK) {
      setBuyError('MetaMask SDK not available');
      setBuyLoading(false);
      return;
    }

    // 检查是否有卖单数据
    if (!orderData || Object.keys(orderData).length === 0) {
      setBuyError('请先创建卖单');
      setBuyLoading(false);
      return;
    }

    try {
      const blockNumber = await getBlockNumber();
      const blockInfo = await getBlockInfo(blockNumber);
      const chainTime = BigInt(
        blockInfo?.timestamp ?? Math.floor(Date.now() / 1000)
      );
      const validUntil = chainTime + BigInt(3600);
      const createAT = chainTime;
      const ethPrice = ethers.parseEther(price);

      // 先获取合约nonce，确保签名和执行的nonce一致
      const nftOrderAbi = findAbiByContractName('nft-order-manager');
      const nftOrderContract = await createContractInstance(metamaskSDK, {
        chainId,
        abi: assertAbi(nftOrderAbi),
        contractAddress: addressMap.contractAddress,
      });

      const nonce = await getNftOrderNonce(nftOrderContract);
      if (nonce === null || nonce === undefined) {
        setBuyError('获取nonce失败');
        setBuyLoading(false);
        return;
      }

      console.log('买单成功获取nonce:', nonce);

      // 1.创建买单EIP712消息 - 使用与卖单相同的参数
      const buyTypeData = createEIP712Message.nftMint({
        chainId,
        contractAddress: addressMap.contractAddress,
        order: {
          to: accounts[0] as `0x${string}`,
          tokenId: 10, // 与卖单一致
          nonce: Number(nonce), // 使用合约nonce，不是Date.now()
          side: 1, // 买单
          matchingPolicy: matchingPolicyMap.default,
          nftContract: addressMap.nftContractAddress,
          price: ethPrice.toString(),
          validUntil: validUntil.toString(),
          createAT: createAT.toString(),
          fees: [],
          extraParams: '0x',
        },
      });

      console.log('买单EIP712消息:', buyTypeData);
      console.log('使用的nonce:', nonce);

      // 2.进行EIP712签名
      const buySignature = await signEIP712(buyTypeData);

      // 3.买单不需要NFT授权，直接创建订单
      if (buySignature) {
        // 订单方向
        const side = orderSideMap.Buy;

        // 使用与卖单相同的tokenId
        const nftTokenId = BigInt(10);

        // 匹配策略地址
        const matchingPolicy = matchingPolicyMap.default;

        // 资产类型
        const assetType = assetTypeMap.ERC721;

        // 订单数量
        const amount = BigInt(1);

        // 支付token地址
        const paymentToken = ethers.ZeroAddress;

        const sendParams = createSendParams({
          vrs: buySignature,
          blockNumber: blockNumber ?? 0,
          signatureVersion: 0,
          extraSignature: '0x',
          order: {
            nonce, // 使用相同的nonce
            trader: accounts[0] as `0x${string}`,
            side,
            matchingPolicy,
            nftContract: addressMap.nftContractAddress,
            tokenId: nftTokenId,
            AssetType: assetType,
            amount,
            paymentToken,
            price: ethPrice,
            validUntil,
            createAT,
            fees: [],
            extraParams: '0x',
          },
        });

        console.log('买单参数:', sendParams);
        setBuyOrderData(sendParams);
        setBuyLoading(false);
      }
    } catch (err) {
      console.error('买单创建失败:', err);
      setBuyError(
        `买单创建失败: ${err instanceof Error ? err.message : '未知错误'}`
      );
      setBuyLoading(false);
    }
  };

  const onMatchClick = async () => {
    console.log('onMatchClick');
    if (!metamaskSDK) {
      console.error('请先连接钱包');
      return;
    }

    if (!chainId) {
      console.error('请先选择网络');
      return;
    }
    console.log('orderData', orderData);
    console.log('buyOrderData', buyOrderData);

    // 检查是否有完整的订单数据
    if (
      !(orderData && buyOrderData) ||
      Object.keys(orderData).length === 0 ||
      Object.keys(buyOrderData).length === 0
    ) {
      console.error('请先创建卖单和买单');
      return;
    }

    try {
      const nftOrderAbi = findAbiByContractName('nft-order-manager');
      const nftOrderContract = await createContractInstance(metamaskSDK, {
        chainId,
        abi: assertAbi(nftOrderAbi),
        contractAddress: addressMap.contractAddress,
      });

      if (nftOrderContract) {
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
        console.log('准备执行撮合交易');
        console.log('卖单输入:', sellInput);
        console.log('买单输入:', buyInput);
        console.log('买单价格 (wei):', buyPrice);

        const executeTx = await nftOrderContract.execute(sellInput, buyInput, {
          value: buyPrice,
        });

        // console.log('撮合交易已发送:', executeTx.hash);
        const receipt = await executeTx.wait();
        console.log('撮合交易成功', receipt);
      }
    } catch (err) {
      console.error('发起撮合交易失败:', err);
    }
  };

  // 获取订单hash，通过合约方法_hashOrder
  const onGetOrderHash = async () => {
    if (!metamaskSDK) {
      console.error('请先连接钱包');
      return;
    }

    if (!chainId) {
      console.error('请先选择网络');
      return;
    }

    const nftOrderAbi = findAbiByContractName('nft-order-manager');
    const nftOrderContract = await createContractInstance(metamaskSDK, {
      chainId,
      abi: assertAbi(nftOrderAbi),
      contractAddress: addressMap.contractAddress,
    });

    if (nftOrderContract) {
      try {
        const orderHash = await nftOrderContract._hashOrder(
          orderData.order,
          orderData.order.nonce
        );
        console.log('订单hash:', orderHash);
        const domainHash = await getDomainHash();
        console.log('domainHash1:', domainHash);
        const domain = {
          name: 'XY',
          version: '1.0',
          chainId,
          verifyingContract: addressMap.contractAddress, // 智能合约地址
        };
        const hash = ethers.TypedDataEncoder.hashDomain(domain);
        console.log('domainHash2:', hash);
      } catch (err) {
        console.error('获取订单hash失败:', err);
      }
    }
  };

  async function getDomainHash() {
    if (!metamaskSDK) {
      console.error('请先连接钱包');
      return;
    }

    if (!chainId) {
      console.error('请先选择网络');
      return;
    }

    const nftOrderAbi = findAbiByContractName('nft-order-manager');
    const nftOrderContract = await createContractInstance(metamaskSDK, {
      chainId,
      abi: assertAbi(nftOrderAbi),
      contractAddress: addressMap.contractAddress,
    });

    if (nftOrderContract) {
      const domainHash = await nftOrderContract.getDOMAIN_SEPARATOR();
      return domainHash;
    }
    return null;
  }

  return (
    <div className="flex w-full flex-col">
      <p>签名演示</p>

      {/* 显示当前链ID */}
      {chainId && (
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

      <div className="flex w-full gap-2">
        <Button
          className="mt-4 max-w-[100px] rounded-md bg-gray-100 p-2 text-center text-gray-500 text-sm"
          onClick={onMatchClick}
        >
          发起撮合交易
        </Button>
        <Button
          className="mt-4 max-w-[100px] rounded-md bg-gray-100 p-2 text-center text-gray-500 text-sm"
          onClick={onGetOrderHash}
        >
          获取订单hash
        </Button>
        <Button
          className="mt-4 max-w-[100px] rounded-md bg-blue-100 p-2 text-center text-blue-500 text-sm"
          onClick={async () => {
            console.log('=== 调试信息 ===');
            console.log('MetaMask SDK:', !!metamaskSDK);
            console.log('链ID:', chainId);
            console.log('账户:', accounts);
            console.log('合约地址:', addressMap.contractAddress);

            if (metamaskSDK && chainId) {
              try {
                const nftOrderAbi = findAbiByContractName('nft-order-manager');
                const nftOrderContract = await createContractInstance(
                  metamaskSDK,
                  {
                    chainId,
                    abi: assertAbi(nftOrderAbi),
                    contractAddress: addressMap.contractAddress,
                  }
                );

                if (nftOrderContract) {
                  const nonce = await getNftOrderNonce(nftOrderContract);
                  console.log('调试 - 获取到的nonce:', nonce);
                  console.log('调试 - nonce类型:', typeof nonce);
                  console.log('调试 - nonce是否为null:', nonce === null);
                  console.log(
                    '调试 - nonce是否为undefined:',
                    nonce === undefined
                  );
                }
              } catch (err) {
                console.error('调试 - 错误:', err);
              }
            }
          }}
        >
          调试Nonce
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">错误: {error.message}</div>
      )}
    </div>
  );
}
