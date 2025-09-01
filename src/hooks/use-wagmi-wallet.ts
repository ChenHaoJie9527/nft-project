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

  useEffect(() => {
    if (address && isConnected) {
      setAccounts([address]);
      setChainId(chainId || undefined);
    } else {
      // 断开连接时清空状态
      setAccounts([]);
      setChainId(undefined);
      clearSignatureResult();
    }
  }, [
    address,
    isConnected,
    chainId,
    setAccounts,
    setChainId,
    clearSignatureResult,
  ]);

  /**
   * 同步账户和网络状态到 store
   */
  const syncState = () => {
    if (address && isConnected) {
      setAccounts([address]);
      setChainId(chainId || undefined);
    } else {
      setAccounts([]);
      setChainId(undefined);
    }
  };

  // 适配的签名方法
  const signEIP712WithWagmi = async (message: any) => {
    return await signEIP712(message, signTypedDataAsync);
  };

  const signPersonalMessageWithWagmi = async (message: string) => {
    return await signPersonalMessage(message, signMessageAsync);
  };

  return {
    // 状态 - 优先使用 store 中的状态，确保一致性
    accounts: address && isConnected ? [address] : [],
    chainId: isConnected ? chainId || null : null,
    isStoreConnected: isConnected,
    isConnecting,
    loading,
    error,

    // 方法
    truncateAddress,
    getPrimaryAddress: () => (address && isConnected ? address : ''),
    isConnected: () => isConnected,
    signEIP712: signEIP712WithWagmi,
    signPersonalMessage: signPersonalMessageWithWagmi,
    clearSignatureResult,
    syncState,

    // 签名结果
    lastEIP712SignatureResult,
    lastPersonalSignatureResult,
  };
}
