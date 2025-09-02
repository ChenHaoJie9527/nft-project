import type { EIP712Message } from '@/types';

type NftMint = {
  chainId: number;
  contractAddress: string;
  order: {
    to: string;
    tokenId: number;
    nonce: number;
    side?: 0 | 1; // 0: 卖出, 1: 买入
    matchingPolicy?: string;
    nftContract?: string;
    price?: string | bigint;
    validUntil?: string | bigint;
    createAT?: string | bigint;
    fees?: Array<{ rate: number; recipient: string }>;
    extraParams?: string;
  };
};

// 常用的EIP712消息结构
export const createEIP712Message = {
  // 创建EIP712挂单签名
  nftMint: ({ chainId, contractAddress, order }: NftMint): EIP712Message => ({
    domain: {
      name: 'XY',
      version: '1.0',
      chainId,
      verifyingContract: contractAddress, // 智能合约地址
    },
    types: {
      Fee: [
        { name: 'rate', type: 'uint16' },
        { name: 'recipient', type: 'address' },
      ],
      Order: [
        { name: 'trader', type: 'address' },
        { name: 'side', type: 'uint8' },
        { name: 'matchingPolicy', type: 'address' },
        { name: 'nftContract', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'AssetType', type: 'uint8' },
        { name: 'amount', type: 'uint256' },
        { name: 'paymentToken', type: 'address' },
        { name: 'price', type: 'uint256' },
        { name: 'validUntil', type: 'uint256' },
        { name: 'createAT', type: 'uint256' },
        { name: 'fees', type: 'Fee[]' },
        { name: 'extraParams', type: 'bytes' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'Order',
    message: {
      trader: order.to,
      side: order.side, // 0: 卖出, 1: 买入
      matchingPolicy: order.matchingPolicy,
      nftContract: order.nftContract,
      tokenId: BigInt(order.tokenId),
      AssetType: 0,
      amount: BigInt(1),
      paymentToken: '0x0000000000000000000000000000000000000000',
      price: BigInt(order.price ?? 0),
      validUntil: BigInt(order.validUntil ?? 0),
      createAT: BigInt(order.createAT ?? 0),
      fees: order.fees,
      extraParams: order.extraParams,
      nonce: BigInt(order.nonce),
    },
  }),
  // 创建NFT系列出价EIP-712消息
  nftCollectionBid: ({
    chainId,
    contractAddress,
    order,
  }: NftMint): Partial<EIP712Message> => ({
    domain: {
      name: 'XY',
      version: '1.0',
      chainId,
      verifyingContract: contractAddress, // 智能合约地址
    },
    types: {
      Fee: [
        { name: 'rate', type: 'uint16' },
        { name: 'recipient', type: 'address' },
      ],
      Order: [
        { name: 'trader', type: 'address' },
        { name: 'side', type: 'uint8' },
        { name: 'matchingPolicy', type: 'address' },
        { name: 'nftContract', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'AssetType', type: 'uint8' },
        { name: 'amount', type: 'uint256' },
        { name: 'paymentToken', type: 'address' },
        { name: 'price', type: 'uint256' },
        { name: 'validUntil', type: 'uint256' },
        { name: 'createAT', type: 'uint256' },
        { name: 'fees', type: 'Fee[]' },
        { name: 'extraParams', type: 'bytes' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'CollectionOrder',
    message: {
      trader: order.to,
      side: order.side, // 0: 卖出, 1: 买入
      matchingPolicy: order.matchingPolicy,
      nftContract: order.nftContract,
      tokenId: order.tokenId || '0x',
      AssetType: 0,
      amount: BigInt(1),
      paymentToken: '0x0000000000000000000000000000000000000000',
      price: BigInt(order.price ?? 0),
      validUntil: BigInt(order.validUntil ?? 0),
      createAT: BigInt(order.createAT ?? 0),
      fees: order.fees,
      extraParams: order.extraParams,
      nonce: BigInt(order.nonce),
    },
  }),
};
