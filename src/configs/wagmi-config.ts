'use client';

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, safe, walletConnect } from 'wagmi/connectors';

const isDevelopment = process.env.NODE_ENV === 'development';
export const defaultChain = isDevelopment ? sepolia : mainnet;

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
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
