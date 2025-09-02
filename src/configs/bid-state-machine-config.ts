import { getPublicClient } from '@wagmi/core';
import { parseEther } from 'viem';
import { addressMap, matchingPolicyMap } from '@/constants';
import { findAbiByContractName } from '@/lib/abi-utils';
import { createContractConfig, readContractData } from '@/lib/contract-utils';
import { createEIP712Message } from '@/lib/eip712-utils';
import {
  checkBalanceSufficient,
  depositToEthPool,
  getUserEthPoolBalance,
} from '@/lib/eth-pool-utils';
import { safeAllExists } from '@/lib/utils';
import { useWalletAccountsStore } from '@/stores/wallet-accounts';
import { wagmiConfig } from './wagmi-config';

/**
 * 出价状态
 */
export type BidState =
  | 'IDLE'
  | 'VALIDATING'
  | 'CHECKING_BALANCE'
  | 'DEPOSITING_ETH'
  | 'RE_CHECKING_BALANCE'
  | 'GETTING_TIME'
  | 'GETTING_NONCE'
  | 'CREATING_BID_MESSAGE'
  | 'SIGNING_BID'
  | 'APPROVING_PAYMENT_TOKEN'
  | 'SUBMITTING_BID'
  | 'SUCCESS'
  | 'ERROR';

/**
 * 出价状态机上下文数据
 */
type BidContext = {
  chainId: number | null;
  accounts: string[];
  collectionAddress: string; // NFT系列合约地址
  bidPrice: string; // 出价金额
  blockNumber: number | null | bigint;
  chainTime: bigint | null;
  validUntil: bigint | null;
  createAT: bigint | null;
  nonce: number | null;
  typedData: any | null;
  signature: any | null;
  balance: bigint | null; // 资金池余额
  error: string | null;
  needsDeposit: boolean; // 是否需要充值
  requiredAmount: bigint; // 需要充值的金额
  depositAmount: bigint; // 建议充值金额
  depositCompleted: boolean; // 充值是否完成
  depositTxHash?: string; // 充值交易哈希
};

/**
 * 状态机配置
 */
type StateConfig = {
  name: string;
  progress: number;
  action: (
    context: BidContext
  ) => Promise<Partial<BidContext>> | Partial<BidContext>;
  canTransition: (context: BidContext) => boolean;
};

type ActionParams = Pick<
  BidContext,
  'chainId' | 'accounts' | 'collectionAddress' | 'bidPrice'
>;

type Action = (params: ActionParams) => Promise<any>;
type Reset = () => void;
type GetCurrentStep = () => string;
type GetProgressPercentage = () => number;
type IsInState = (state: BidState) => boolean;
type GetContext = () => BidContext;

export type BidStateMachineState = {
  currentState: BidState;
  context: BidContext;
  progress: number;
  debugMode: boolean;

  start: Action;
  reset: Reset;
  getCurrentStep: GetCurrentStep;
  getProgressPercentage: GetProgressPercentage;
  isInState: IsInState;
  getContext: GetContext;
};

/**
 * 状态配置映射
 */
export const bidStateConfigs: Record<BidState, StateConfig> = {
  IDLE: {
    name: '准备开始',
    progress: 0,
    action: async () => ({}),
    canTransition: () => true,
  },

  VALIDATING: {
    name: '验证钱包和网络',
    progress: 10,
    action: (context) => {
      if (
        !(
          context.chainId ||
          context.accounts.length ||
          context.collectionAddress
        )
      ) {
        return Promise.reject(new Error('钱包、网络或系列地址无效'));
      }
      return Promise.resolve({});
    },
    canTransition: (context) => {
      return !!(
        context.chainId &&
        context.accounts.length &&
        context.collectionAddress
      );
    },
  },

  // 检查资金池余额
  CHECKING_BALANCE: {
    name: '检查资金池余额',
    progress: 20,
    action: async (context) => {
      try {
        // 1.获取用户资金池余额
        const balance = await getUserEthPoolBalance(
          context.chainId || 0,
          context.accounts[0]
        );

        // 2.检查余额是否足够
        const bidAmount = parseEther(context.bidPrice);
        // 3.检查余额是否足够
        const balanceCheck = checkBalanceSufficient(balance, bidAmount);

        if (balanceCheck.needsDeposit) {
          // 4.需要充值
          return {
            balance,
            needsDeposit: true,
            requiredAmount: balanceCheck.requiredDeposit,
            depositAmount: bidAmount,
          };
        }

        return { balance, needsDeposit: false };
      } catch (error) {
        return Promise.reject(error);
      }
    },
    canTransition: (context) => {
      return !!(
        context.chainId &&
        context.accounts.length &&
        context.collectionAddress
      );
    },
  },

  // 充值状态
  DEPOSITING_ETH: {
    name: '充值ETH到资金池',
    progress: 25,
    action: async (context) => {
      try {
        // 1.计算需要充值的金额
        const bidAmount = parseEther(context.bidPrice);
        const currentBalance = context.balance || BigInt(0);
        const requiredAmount = bidAmount - currentBalance;

        // 2.充值
        const result = await depositToEthPool(
          context.chainId || 0,
          requiredAmount
        );

        // 3.返回结果
        return {
          depositCompleted: true,
          depositAmount: result.amount,
          depositTxHash: result.hash,
        };
      } catch (error) {
        return Promise.reject(new Error(`充值失败: ${error}`));
      }
    },
    canTransition: (context) => {
      return context.needsDeposit === true;
    },
  },

  // 重新检查余额状态
  RE_CHECKING_BALANCE: {
    name: '重新检查资金池余额',
    progress: 30,
    action: async (context) => {
      try {
        // 1.获取用户资金池余额
        const balance = await getUserEthPoolBalance(
          context.chainId || 0,
          context.accounts[0]
        );

        // 2.检查余额是否足够
        const bidAmount = parseEther(context.bidPrice);
        // 3.检查余额是否足够
        const balanceCheck = checkBalanceSufficient(balance, bidAmount);

        // 4.检查余额是否足够
        if (!balanceCheck.sufficient) {
          throw new Error(
            `充值后余额仍然不足，需要 ${context.bidPrice} ETH，当前余额 ${balance}`
          );
        }

        return { balance, needsDeposit: false };
      } catch (error) {
        return Promise.reject(error);
      }
    },
    canTransition: (context) => {
      return context.depositCompleted === true;
    },
  },

  GETTING_TIME: {
    name: '获取区块链时间',
    progress: 30,
    action: async (_context) => {
      try {
        const publicClient = getPublicClient(wagmiConfig);

        let blockNumber: bigint | null = null;
        let blockInfo: any = null;
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1000;

        // 重试机制：获取区块号
        while (retryCount < maxRetries && !blockNumber) {
          try {
            blockNumber = (await publicClient?.getBlockNumber()) ?? null;
            break;
          } catch (error) {
            console.warn(`获取区块号失败，第 ${retryCount + 1} 次:`, error);
          }

          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }

        if (!blockNumber) {
          return Promise.reject(new Error('无法获取区块号，请检查网络连接'));
        }

        // 重试机制：获取区块信息
        retryCount = 0;
        while (retryCount < maxRetries && !blockInfo) {
          try {
            blockInfo = await publicClient.getBlock({ blockNumber });
            break;
          } catch (error) {
            console.warn(`获取区块信息失败，第 ${retryCount + 1} 次:`, error);
          }

          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }

        if (blockInfo === null) {
          return Promise.reject(new Error('无法获取区块信息，请检查网络连接'));
        }

        // 计算时间
        const chainTime = BigInt(blockInfo.timestamp);
        const validUntil = chainTime + BigInt(3600); // 1小时有效期
        const createAT = chainTime;

        return {
          blockNumber,
          chainTime,
          validUntil,
          createAT,
        };
      } catch (error) {
        return Promise.reject(new Error(`获取区块链时间失败: ${error}`));
      }
    },
    canTransition: (context) => {
      return !!(context.chainId && context.accounts.length && context.balance);
    },
  },

  GETTING_NONCE: {
    name: '获取合约Nonce',
    progress: 40,
    action: async (context) => {
      try {
        const nftOrder = findAbiByContractName('nft-order-manager');
        if (!nftOrder) {
          throw new Error('无法获取合约ABI');
        }

        const contractConfig = createContractConfig(
          addressMap.contractAddress,
          nftOrder,
          context.chainId || 0
        );

        const nonce = await readContractData(contractConfig, 'getNonce');

        if (nonce === null || nonce === undefined) {
          throw new Error('获取合约Nonce失败');
        }

        return Promise.resolve({ nonce });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    canTransition: (context) => !!(context.blockNumber && context.chainTime),
  },

  CREATING_BID_MESSAGE: {
    name: '创建出价签名信息',
    progress: 50,
    action: (context) => {
      const ethPrice = parseEther(context.bidPrice);
      const typedData = createEIP712Message.nftCollectionBid({
        chainId: context.chainId || 0,
        contractAddress: addressMap.contractAddress,
        order: {
          to: context.accounts[0],
          tokenId: BigInt(0),
          nftContract: context.collectionAddress,
          side: 1, // 1: 买入（出价）
          matchingPolicy: matchingPolicyMap.ethPool,
          price: ethPrice.toString(),
          validUntil: context.validUntil?.toString(),
          createAT: context.createAT?.toString(),
          nonce: context.nonce || 0,
          fees: [],
          extraParams: '#01',
          ethPoolContractAddress: addressMap.ethPoolAddress, //TODO: 资金池地址
        },
      });

      return Promise.resolve({ typedData });
    },
    canTransition: (context) => {
      return safeAllExists(context.nonce, context.validUntil, context.createAT);
    },
  },

  SIGNING_BID: {
    name: '等待用户签名',
    progress: 60,
    action: async (context) => {
      const { signTypedDataAsync, signEIP712 } =
        useWalletAccountsStore.getState();
      if (!context.typedData) {
        throw new Error('缺少typedData，无法进行签名');
      }
      try {
        const signature = await signEIP712(
          context.typedData,
          signTypedDataAsync
        );
        return Promise.resolve({ signature });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    canTransition: (context) => {
      return !!context.typedData;
    },
  },

  APPROVING_PAYMENT_TOKEN: {
    name: '授权支付代币',
    progress: 70,
    action: (_context) => {
      try {
        // 这里需要实现WETH或其他支付代币的授权
        // 暂时返回成功，实际实现时需要调用approve方法
        return Promise.resolve({});
      } catch (error) {
        return Promise.reject(new Error(`授权支付代币失败: ${error}`));
      }
    },
    canTransition: (context) => !!context.signature,
  },

  SUBMITTING_BID: {
    name: '提交出价',
    progress: 90,
    action: (_context) => {
      try {
        // 这里需要实现提交出价的逻辑
        // 调用智能合约的submitBid方法
        return Promise.resolve({});
      } catch (error) {
        return Promise.reject(new Error(`提交出价失败: ${error}`));
      }
    },
    canTransition: (context) => !!context.signature,
  },

  SUCCESS: {
    name: '出价成功',
    progress: 100,
    action: async () => ({}),
    canTransition: () => true,
  },

  ERROR: {
    name: '出价失败',
    action: async () => ({}),
    canTransition: () => true,
    progress: 0,
  },
};

export const bidStateTransitions: Record<BidState, BidState[]> = {
  IDLE: ['VALIDATING'],
  VALIDATING: ['CHECKING_BALANCE', 'ERROR'],
  CHECKING_BALANCE: ['DEPOSITING_ETH', 'GETTING_TIME', 'ERROR'],
  DEPOSITING_ETH: ['RE_CHECKING_BALANCE', 'ERROR'],
  RE_CHECKING_BALANCE: ['GETTING_TIME', 'ERROR'],
  GETTING_TIME: ['GETTING_NONCE', 'ERROR'],
  GETTING_NONCE: ['CREATING_BID_MESSAGE', 'ERROR'],
  CREATING_BID_MESSAGE: ['SIGNING_BID', 'ERROR'],
  SIGNING_BID: ['APPROVING_PAYMENT_TOKEN', 'ERROR'],
  APPROVING_PAYMENT_TOKEN: ['SUBMITTING_BID', 'ERROR'],
  SUBMITTING_BID: ['SUCCESS', 'ERROR'],
  SUCCESS: ['IDLE'],
  ERROR: ['IDLE'],
};
