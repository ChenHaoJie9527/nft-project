'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
// import { useLocalStorage } from '@/hooks/use-local-storage';
import { useBuyOrderStateMachineStore } from '@/stores/buy-order-state-machine';
import { useOrderStateMachineStore } from '@/stores/order-state-machine';
import { useWalletAccountsStore } from '@/stores/wallet-accounts';

export default function WalletConnectButton() {
  const { isConnected } = useAccount();
  // const [, setOrderData] = useLocalStorage<any>('sell-order', {});
  // const [, setBuyOrderData] = useLocalStorage<any>('buy-order', {});

  const handleDisconnect = () => {
    // 重置钱包账户状态
    const walletStore = useWalletAccountsStore.getState();
    walletStore.setAccounts([]);
    walletStore.setChainId(undefined);
    walletStore.clearSignatureResult();
    walletStore.setError(null);
    walletStore.setLoading(false);

    // setOrderData({});
    // setBuyOrderData({});

    // 重置订单状态机
    useOrderStateMachineStore.getState().reset();

    // 重置购买订单状态机
    useBuyOrderStateMachineStore.getState().reset();
  };

  useEffect(() => {
    if (!isConnected) {
      handleDisconnect();
    }
  }, [isConnected, handleDisconnect]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openChainModal,
        openAccountModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        if (!ready) {
          return (
            <div
              aria-hidden
              className="pointer-events-none select-none opacity-0"
            >
              <Button
                className="font-responsive text-responsive-sm tracking-responsive"
                disabled
                variant="link"
              >
                Connect Wallet
              </Button>
            </div>
          );
        }

        if (!connected) {
          return (
            <Button
              className="font-responsive text-responsive-sm tracking-responsive"
              onClick={openConnectModal}
              variant="link"
            >
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button onClick={openChainModal} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              Network Error
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {/* 网络选择按钮 */}
            {/* <Button
              className="flex min-h-10 items-center gap-2"
              onClick={openChainModal}
              size="sm"
              variant="outline"
            >
              {chain.hasIcon && (
                <div
                  className="h-4 w-4 flex-shrink-0 overflow-hidden rounded-full"
                  style={{
                    background: chain.iconBackground,
                  }}
                >
                  {chain.iconUrl && (
                    <Image
                      alt={chain.name ?? 'Chain icon'}
                      className="h-full w-full object-cover"
                      height={16}
                      src={chain.iconUrl}
                      width={16}
                    />
                  )}
                </div>
              )}
              <span className="hidden sm:inline">{chain.name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button> */}

            {/* 账户信息按钮 */}
            <Button
              className="flex min-h-10 items-center gap-2"
              onClick={openAccountModal}
              variant="outline"
            >
              <div className="flex items-center gap-2">
                {/* 账户头像 */}
                {account.ensAvatar ? (
                  <Image
                    alt="ENS Avatar"
                    className="h-5 w-5 rounded-full"
                    src={account.ensAvatar}
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <span className="font-medium text-white text-xs">
                      {account.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* 账户信息 */}
                <div className="hidden flex-col items-start sm:flex">
                  <span className="font-medium text-sm">
                    {account.displayName}
                  </span>
                  {account.displayBalance && (
                    <span className="text-muted-foreground text-xs">
                      {account.displayBalance}
                    </span>
                  )}
                </div>

                {/* 移动端显示 */}
                <div className="sm:hidden">
                  <span className="font-medium text-sm">
                    {account.displayName}
                  </span>
                </div>
              </div>
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
