import type { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { parsePersonalSignature } from '@/lib/signature-utils';
import type { EIP712Message } from '@/types';

const ONE_DAY = 24 * 60 * 60 * 1000;

type WalletAccountsState = {
  // 基础数据
  accounts: string[];
  // MetaMask 状态
  metamaskSDK: MetaMaskSDK | null;
  error: Error | null;
  loading: boolean;
  // 网络状态
  chainId: number | null;
  // 持久化相关
  lastConnectedAt: number | null;
  autoConnect: boolean;
  // EIP712签名
  lastEIP712SignatureResult: ethers.Signature | null;
  // 个人消息签名
  lastPersonalSignatureResult: string;
  // 方法
  setAccounts: (accounts: string[]) => void;
  setMetamaskSDK: (sdk: MetaMaskSDK) => void;
  setError: (error: Error | null) => void;
  setLoading: (loading: boolean) => void;
  setAutoConnect: (enabled: boolean) => void;
  setChainId: (chainId: number) => void;
  // 连接方法
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  // 工具方法
  truncateAddress: (address: string, start?: number, end?: number) => string;
  getPrimaryAddress: () => string;
  isConnected: () => boolean;
  canAutoConnect: () => boolean;
  getCurrentChainId: () => Promise<number | null>;
  // 签名方法
  signEIP712: (message: EIP712Message) => Promise<ethers.Signature | null>;
  signPersonalMessage: (message: string) => Promise<string>;
  clearSignatureResult: () => void;
};

export const useWalletAccountsStore = create<WalletAccountsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      accounts: [],
      metamaskSDK: null,
      error: null,
      loading: false,
      chainId: null,
      lastConnectedAt: null,
      autoConnect: true,
      lastEIP712SignatureResult: null,
      lastPersonalSignatureResult: '',

      // 设置方法
      setAccounts: (accounts) => set({ accounts }),
      setMetamaskSDK: (sdk) => set({ metamaskSDK: sdk }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading }),
      setAutoConnect: (enabled) => set({ autoConnect: enabled }),
      setChainId: (chainId) => set({ chainId }),

      // 获取当前链ID
      getCurrentChainId: async () => {
        const { metamaskSDK } = get();
        if (!metamaskSDK) {
          return null;
        }

        try {
          const ethereum = metamaskSDK.getProvider();
          if (!ethereum) {
            return null;
          }

          const chainId = await ethereum.request({ method: 'eth_chainId' });
          const chainIdNumber = Number.parseInt(chainId as string, 16); // 转换为十进制

          // 更新store中的chainId
          set({ chainId: chainIdNumber });

          return chainIdNumber;
        } catch (err) {
          console.error('获取链ID失败:', err);
          return null;
        }
      },

      // 连接方法
      connect: async () => {
        const { metamaskSDK, getCurrentChainId } = get();
        if (!metamaskSDK) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const accounts = await metamaskSDK.connect();

          // 连接成功后获取当前链ID
          const chainId = await getCurrentChainId();

          set({
            accounts,
            chainId,
            loading: false,
            lastConnectedAt: Date.now(),
          });
        } catch (err) {
          set({ error: err as Error, loading: false });
        }
      },

      // 断开连接
      disconnect: async () => {
        const { metamaskSDK } = get();
        if (!metamaskSDK) {
          return;
        }

        set({ loading: true, error: null });

        try {
          await metamaskSDK.disconnect();
          set({
            accounts: [],
            chainId: null,
            loading: false,
            lastConnectedAt: null,
          });
        } catch (err) {
          set({ error: err as Error, loading: false });
        }
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

      // 发起EIP712签名（使用 MetaMask SDK）
      signEIP712: async (typedData) => {
        const { metamaskSDK, accounts, getCurrentChainId } = get();

        if (!metamaskSDK) {
          throw new Error('Metamask SDK not initialized');
        }

        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        set({ loading: true, error: null });

        try {
          // 获取当前链ID并更新typedData
          const currentChainId = await getCurrentChainId();
          if (currentChainId && typedData.domain.chainId !== currentChainId) {
            typedData.domain.chainId = currentChainId;
          }

          // 获取ethereum provider
          const ethereum = metamaskSDK.getProvider();

          if (!ethereum) {
            throw new Error('Ethereum provider not available');
          }

          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();

          const signature = await signer.signTypedData(
            typedData.domain,
            typedData.types,
            typedData.message
          );

          const sig = ethers.Signature.from(signature);

          // 解析签名
          // const signatureResult = parseEIP712Signature(signature as string);
          // console.log('signatureResult:', signatureResult);

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

      // 发起个人消息签名（使用 MetaMask SDK）
      signPersonalMessage: async (message: string) => {
        const { metamaskSDK, accounts } = get();

        if (!metamaskSDK) {
          throw new Error('Metamask SDK not initialized');
        }

        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        set({ loading: true, error: null });

        try {
          // 获取ethereum provider
          const ethereum = metamaskSDK.getProvider();

          if (!ethereum) {
            throw new Error('Ethereum provider not available');
          }

          // 发起个人消息签名请求
          const signature = await ethereum.request({
            method: 'personal_sign',
            params: [message, accounts[0]],
          });

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
