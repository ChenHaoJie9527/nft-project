'use client';

import { MetaMaskSDK } from '@metamask/sdk';
import { useRef } from 'react';
import { useWalletAccountsStore } from '@/stores/wallet-accounts';
import { useClientEffect } from './use-client-effect';

export function useMetamask() {
  const {
    connect,
    disconnect,
    setMetamaskSDK,
    loading,
    error,
    truncateAddress,
    isConnected,
    accounts,
    signEIP712,
    signPersonalMessage,
    getCurrentChainId,
    chainId,
    lastPersonalSignatureResult,
    metamaskSDK,
  } = useWalletAccountsStore();

  const sdkInitialized = useRef(false);

  useClientEffect(() => {
    if (sdkInitialized.current) {
      return;
    }

    const sdk = new MetaMaskSDK({
      dappMetadata: {
        name: 'MetaMask SDK Next.js Quickstart',
        url: window.location.href,
      },
      infuraAPIKey: '4a8fc786350d4b0da44899d2163b2092',
    });
    if (sdk) {
      setMetamaskSDK(sdk);
      sdkInitialized.current = true;
    }
  }, []);

  return {
    connect,
    disconnect,
    loading,
    error,
    truncateAddress,
    isConnected,
    accounts,
    signEIP712,
    signPersonalMessage,
    getCurrentChainId,
    chainId,
    lastPersonalSignatureResult,
    metamaskSDK,
  };
}
