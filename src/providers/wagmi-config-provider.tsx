'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';

const isDevelopment = process.env.NODE_ENV === 'development';
const defaultChain = isDevelopment ? sepolia : mainnet;

const wagmiConfig = createConfig({
  // 支持的网络配置：mainnet是主网，sepolia是测试网
  chains: [mainnet, sepolia],
  // 支持的连接器配置：injected是浏览器扩展，metaMask是浏览器插件，walletConnect是钱包连接器，safe是安全钱包连接器
  connectors: [
    injected({ target: 'metaMask' }), // 检测是否安装了MetaMask浏览器扩展，优先使用MetaMask扩展
    metaMask(), // Metamask连接器
    // 支持walletConnect协议的钱包，需要配置projectId
    walletConnect({
      projectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
        'f8eb68f24794e2ef532781d0d7cc6513',
      metadata: {
        name: 'NFT Project',
        description: 'NFT Gallery Platform',
        url: '',
        icons: [''],
      },
    }),
    // 支持Safe协议的多签钱包
    safe(),
  ],
  // 支持的传输层配置：http是HTTP传输层，ws是WebSocket传输层
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

type WagmiConfigProviderProps = {
  children: ReactNode;
};

export function WagmiConfigProvider({ children }: WagmiConfigProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={defaultChain} locale="zh-CN">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiConfig };
