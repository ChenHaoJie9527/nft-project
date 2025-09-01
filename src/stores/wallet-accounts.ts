import { ethers } from 'ethers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { parsePersonalSignature } from '@/lib/signature-utils';
import type { EIP712Message } from '@/types';

const ONE_DAY = 24 * 60 * 60 * 1000;

type WalletAccountsState = {
  // 基础数据 - 现在从wagmi获取，这里作为缓存
  accounts: string[];
  // 网络状态 - 现在从wagmi获取，这里作为缓存
  chainId: number | null;
  // 错误状态
  error: Error | null;
  loading: boolean;
  // 持久化相关
  lastConnectedAt: number | null;
  autoConnect: boolean;
  // EIP712签名
  lastEIP712SignatureResult: ethers.Signature | null;
  // 个人消息签名
  lastPersonalSignatureResult: string;
  // 签名函数 - 不持久化
  signTypedDataAsync: any | null;
  signMessageAsync: any | null;
  // 方法
  setAccounts: (accounts: string[]) => void;
  setError: (error: Error | null) => void;
  setLoading: (loading: boolean) => void;
  setAutoConnect: (enabled: boolean) => void;
  setChainId: (chainId: number) => void;
  setSignTypedDataAsync: (fn: any) => void;
  setSignMessageAsync: (fn: any) => void;
  // 工具方法
  truncateAddress: (address: string, start?: number, end?: number) => string;
  getPrimaryAddress: () => string;
  isConnected: () => boolean;
  canAutoConnect: () => boolean;
  getCurrentChainId: () => Promise<number | null>;
  // 签名方法 - 需要外部传入wagmi的签名函数
  signEIP712: (
    message: EIP712Message,
    signTypedDataAsync: any
  ) => Promise<ethers.Signature | null>;
  signPersonalMessage: (
    message: string,
    signMessageAsync: any
  ) => Promise<string>;
  clearSignatureResult: () => void;
};

export const useWalletAccountsStore = create<WalletAccountsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      accounts: [],
      error: null,
      loading: false,
      chainId: null,
      lastConnectedAt: null,
      autoConnect: true,
      lastEIP712SignatureResult: null,
      lastPersonalSignatureResult: '',
      signTypedDataAsync: null,
      signMessageAsync: null,

      // 设置方法
      setAccounts: (accounts) => set({ accounts }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading }),
      setAutoConnect: (enabled) => set({ autoConnect: enabled }),
      setChainId: (chainId) => set({ chainId }),
      setSignTypedDataAsync: (fn) => set({ signTypedDataAsync: fn }),
      setSignMessageAsync: (fn) => set({ signMessageAsync: fn }),

      // 获取当前链ID - 现在从store中获取缓存的chainId
      getCurrentChainId: () => {
        const { chainId } = get();
        return Promise.resolve(chainId || null);
      },

      // 工具方法
      truncateAddress: (address: string, start = 6, end = 4) => {
        if (!address) {
          return '';
        }
        return `${address.slice(0, start)}...${address.slice(-end)}`;
      },

      getPrimaryAddress: () => {
        return get().accounts[0] || '';
      },

      isConnected: () => {
        return get().accounts.length > 0;
      },

      // 检查是否可以自动重连
      canAutoConnect: () => {
        const { accounts, lastConnectedAt, autoConnect } = get();

        if (!autoConnect || accounts.length === 0) {
          return false;
        }

        const timeSinceLastConnect = Date.now() - (lastConnectedAt || 0);

        return timeSinceLastConnect < ONE_DAY;
      },

      // 发起EIP712签名（使用 wagmi）
      signEIP712: async (typedData, signTypedDataAsync) => {
        const { accounts } = get();

        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        if (!signTypedDataAsync) {
          throw new Error('signTypedDataAsync function not provided');
        }

        set({ loading: true, error: null });

        try {
          // 使用wagmi的签名方法
          const signature = await signTypedDataAsync({
            domain: typedData.domain,
            types: typedData.types,
            primaryType: 'Order',
            message: typedData.message,
          });

          const sig = ethers.Signature.from(signature);

          set({
            loading: false,
            lastEIP712SignatureResult: sig || null,
          });

          return sig;
        } catch (err) {
          set({ error: err as Error, loading: false });
          throw err;
        }
      },

      // 发起个人消息签名（使用 wagmi）
      signPersonalMessage: async (message: string, signMessageAsync) => {
        const { accounts } = get();

        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        if (!signMessageAsync) {
          throw new Error('signMessageAsync function not provided');
        }

        set({ loading: true, error: null });

        try {
          // 使用wagmi的签名方法
          const signature = await signMessageAsync({ message });

          // 解析签名
          const signatureResult = parsePersonalSignature(signature);

          set({
            loading: false,
            lastPersonalSignatureResult: signatureResult || '',
          });

          return signatureResult;
        } catch (err) {
          set({ error: err as Error, loading: false });
          throw err;
        }
      },

      // 清除签名结果
      clearSignatureResult: () =>
        set({
          lastEIP712SignatureResult: null,
          lastPersonalSignatureResult: '',
        }),
    }),
    {
      name: 'wallet-accounts-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        chainId: state.chainId,
        lastConnectedAt: state.lastConnectedAt,
        autoConnect: state.autoConnect,
      }),
    }
  )
);
