'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { wagmiConfig } from '@/configs/wagmi-config';

type WagmiProviderProps = {
  children: ReactNode;
};

const isDevelopment = process.env.NODE_ENV === 'development';
const defaultChain = isDevelopment ? sepolia : mainnet;

/**
 * @description wagmi提供者
 * @param {ReactNode} children
 * @returns {ReactNode}
 */
export function WagmiComponentProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider initialChain={defaultChain} locale="zh-CN">
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

WagmiComponentProvider.displayName = 'WagmiProvder';
