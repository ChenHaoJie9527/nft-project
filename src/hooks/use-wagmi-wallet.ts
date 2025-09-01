'use client';

import { useEffect } from 'react';
import {
  useAccount,
  useChainId,
  useSignMessage,
  useSignTypedData,
} from 'wagmi';
import { useWalletAccountsStore } from '@/stores/wallet-accounts';

export function useWagmiWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  const { signMessageAsync } = useSignMessage();

  const {
    setAccounts,
    setChainId,
    setSignTypedDataAsync,
    setSignMessageAsync,
    truncateAddress,
    signEIP712,
    signPersonalMessage,
    lastEIP712SignatureResult,
    lastPersonalSignatureResult,
    clearSignatureResult,
    loading,
    error,
  } = useWalletAccountsStore();

  // 同步签名函数到 store
  useEffect(() => {
    setSignTypedDataAsync(signTypedDataAsync);
  }, [signTypedDataAsync, setSignTypedDataAsync]);

  useEffect(() => {
    setSignMessageAsync(signMessageAsync);
  }, [signMessageAsync, setSignMessageAsync]);

  // 移除 useEffect，改为手动同步方法
  const syncState = () => {
    if (address) {
      setAccounts([address]);
    } else {
      setAccounts([]);
    }
    setChainId(chainId);
  };

  // 适配的签名方法
  const signEIP712WithWagmi = async (message: any) => {
    return await signEIP712(message, signTypedDataAsync);
  };

  const signPersonalMessageWithWagmi = async (message: string) => {
    return await signPersonalMessage(message, signMessageAsync);
  };

  return {
    // 状态
    accounts: address ? [address] : [],
    chainId,
    isStoreConnected: isConnected,
    isConnecting,
    loading,
    error,

    // 方法
    truncateAddress,
    getPrimaryAddress: () => address || '',
    isConnected: () => isConnected,
    signEIP712: signEIP712WithWagmi,
    signPersonalMessage: signPersonalMessageWithWagmi,
    clearSignatureResult,
    syncState, // 新增手动同步方法

    // 签名结果
    lastEIP712SignatureResult,
    lastPersonalSignatureResult,
  };
}
