import type { ethers } from 'ethers';

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
};

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type ApiResponse<T> = {
  data: T;
  error?: string;
};

// 添加EIP712类型定义
export type EIP712Domain = {
  name: string; // 域名名称
  version: string; // 域名版本
  chainId: number; // 链ID
  verifyingContract: any; // 验证合约地址
};

// EIP712消息结构
export type EIP712Message = {
  domain: EIP712Domain; // 域名
  types: Record<
    string,
    Array<{
      name: string; // 名称
      type: string; // 类型
    }>
  >;
  primaryType: string; // 主类型
  message: Record<string, any>; // 消息
};

export type ABI = ethers.Interface;

export type SendParams = {
  order: any;
  vrs: {
    v: number;
    r: string;
    s: string;
  };
  blockNumber: number;
  signatureVersion: number;
  extraSignature: string;
};
