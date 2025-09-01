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

// const wagmiConfig = getDefaultConfig({
//   appName: 'NFT Project',
//   projectId:
//     process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
//     'f8eb68f24794e2ef532781d0d7cc6513',
//   chains: [mainnet, sepolia],
//   ssr: true,
// });

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
    metaMask(),
    walletConnect({
      projectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
        'f8eb68f24794e2ef532781d0d7cc6513',
    }),
    safe(),
  ],
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
