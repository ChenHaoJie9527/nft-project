'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnectButton() {
  return (
    <ConnectButton
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
      chainStatus="name"
      label="连接钱包"
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
    />
  );
}
