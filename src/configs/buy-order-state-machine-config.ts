import { getPublicClient } from '@wagmi/core';
import { parseEther, zeroAddress } from 'viem'; // 替换 ethers
import {
  addressMap,
  assetTypeMap,
  matchingPolicyMap,
  orderSideMap,
} from '@/constants';
import { findAbiByContractName } from '@/lib/abi-utils';
import { createContractConfig, readContractData } from '@/lib/contract-utils';
import { createSendParams } from '@/lib/create-send-params';
import { createEIP712Message } from '@/lib/eip712-utils';
import { checkUserFunds } from '@/lib/eth-pool-utils';
import { executeOrderMatching } from '@/lib/execute-order-matching';
import { safeAllExists } from '@/lib/utils';
import { useWalletAccountsStore } from '@/stores/wallet-accounts';
import { wagmiConfig } from './wagmi-config';

/**
 * 购买订单状态机状态
 */
export type BuyOrderState =
  | 'IDLE'
  | 'CHECKING_FUNDS'
  | 'VALIDATING'
  | 'GETTING_TIME'
  | 'GETTING_NONCE'
  | 'CREATING_MESSAGE'
  | 'SIGNING'
  | 'BUILDING_ORDER'
  | 'SUCCESS'
  | 'ERROR';

/**
 * 购买订单状态机上下文
 */
export type BuyOrderContext = {
  chainId: number | null;
  accounts: string[];
  price: string;
  blockNumber: number | null;
  chainTime: bigint | null;
  validUntil: bigint | null;
  createAT: bigint | null;
  nonce: number | null;
  typedData: any | null;
  signature: any | null;
  orderData: any | null;
  hasEnoughFunds: boolean | null;
  transactionHash: string | null;
  transactionStatus: 'pending' | 'confirmed' | 'failed' | null;
  error: string | null;
  sellOrderData?: any | null;
};

/**
 * 购买订单状态机配置
 */
export type BuyOrderStateConfig = {
  name: string;
  progress: number;
  action: (
    context: BuyOrderContext
  ) => Promise<Partial<BuyOrderContext>> | Partial<BuyOrderContext>;
  canTransition: (context: BuyOrderContext) => boolean;
};

/**
 * 购买订单状态机状态类型
 */
export type BuyOrderStateMachineState = {
  currentState: BuyOrderState;
  context: BuyOrderContext;
  progress: number;
  debugMode: boolean;
  start: (
    params: Pick<
      BuyOrderContext,
      'chainId' | 'accounts' | 'price' | 'sellOrderData'
    >
  ) => Promise<any>;
  reset: () => void;
  getCurrentStep: () => string;
  getProgressPercentage: () => number;
  isInState: (state: BuyOrderState) => boolean;
  getContext: () => BuyOrderContext;
  enableDebug: () => void;
  disableDebug: () => void;
  toggleDebug: () => void;
};

/**
 * 状态配置映射
 */
export const buyOrderStateConfigs: Record<BuyOrderState, BuyOrderStateConfig> =
  {
    IDLE: {
      name: '准备开始买单',
      progress: 0,
      action: async () => ({}),
      canTransition: () => true,
    },

    CHECKING_FUNDS: {
      name: '检查用户资金',
      progress: 5,
      action: async (context) => {
        try {
          return await checkUserFunds(context);
        } catch (error) {
          return Promise.reject(new Error(`资金检查失败: ${error}`));
        }
      },
      canTransition: (context) => {
        return !!(context.chainId && context.accounts.length);
      },
    },

    VALIDATING: {
      name: '验证钱包和网络',
      progress: 10,
      action: (context) => {
        if (!(context.chainId || context.accounts.length)) {
          return Promise.reject(new Error('钱包或者网络无效'));
        }
        return Promise.resolve({});
      },
      canTransition: (context) => {
        return !!(
          context.chainId &&
          context.accounts.length &&
          context.hasEnoughFunds
        );
      },
    },

    GETTING_TIME: {
      name: '获取区块链时间',
      progress: 20,
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
            } catch (_err) {
              console.warn(`获取区块号失败，第 ${retryCount + 1} 次重试`);
            }
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
          }

          if (blockNumber === null) {
            return Promise.reject(new Error('无法获取区块号，请检查网络连接'));
          }

          // 重试机制：获取区块信息
          retryCount = 0;
          while (retryCount < maxRetries && !blockInfo) {
            try {
              blockInfo = await publicClient.getBlock({ blockNumber });
              break;
            } catch (_err) {
              console.warn(`获取区块信息失败，第 ${retryCount + 1} 次重试`);
            }
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
          }

          if (blockInfo === null) {
            return Promise.reject(
              new Error('无法获取区块信息，请检查网络连接')
            );
          }

          // 计算时间
          const chainTime = BigInt(blockInfo.timestamp);

          // 订单有效期
          const validUntil = chainTime + BigInt(3600);

          // 创建订单时间
          const createAT = chainTime;

          return Promise.resolve({
            blockNumber: Number(blockNumber),
            chainTime,
            validUntil,
            createAT,
          });
        } catch (error) {
          return Promise.reject(new Error(`获取区块链时间失败: ${error}`));
        }
      },
      canTransition: (context) => {
        return !!(context.chainId && context.accounts.length);
      },
    },

    GETTING_NONCE: {
      name: '获取合约Nonce',
      progress: 30,
      action: async (context) => {
        try {
          // 1. 获取 ABI
          const nftOrder = findAbiByContractName('nft-order-manager');
          if (!nftOrder) {
            throw new Error('找不到合约ABI');
          }

          // 2. 创建合约配置
          const contractConfig = createContractConfig(
            addressMap.contractAddress,
            nftOrder,
            context.chainId || 0
          );

          // 3. 使用 readContractData 读取 nonce
          const nonce = await readContractData(contractConfig, 'getNonce');

          if (nonce === null || nonce === undefined) {
            throw new Error('获取Nonce失败');
          }

          return Promise.resolve({ nonce });
        } catch (_err) {
          return Promise.reject(_err);
        }
      },
      canTransition: (context) => {
        return !!(context.blockNumber && context.chainTime);
      },
    },

    CREATING_MESSAGE: {
      name: '创建买单签名信息',
      progress: 40,
      action: (context) => {
        const ethPrice = parseEther(context.price); // 使用 viem.parseEther
        const typedData = createEIP712Message.nftMint({
          chainId: context.chainId || 0,
          contractAddress: addressMap.contractAddress,
          order: {
            to: context.accounts[0] as `0x${string}`,
            tokenId: 10, // 与卖单一致
            nonce: context.nonce || 0,
            side: 1, // 买单
            matchingPolicy: matchingPolicyMap.default,
            nftContract: addressMap.nftContractAddress,
            price: ethPrice.toString(),
            validUntil: context.validUntil?.toString(),
            createAT: context.createAT?.toString(),
            fees: [],
            extraParams: '0x',
          },
        });

        return { typedData };
      },
      canTransition: (context) => {
        const result = safeAllExists(
          context.nonce,
          context.validUntil,
          context.createAT
        );
        return result;
      },
    },

    SIGNING: {
      name: '等待用户签名买单',
      progress: 50,
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
        } catch (_err) {
          return Promise.reject(_err);
        }
      },
      canTransition: (context) => {
        return !!context.typedData;
      },
    },

    BUILDING_ORDER: {
      name: '构建买单数据',
      progress: 90, // 调整进度，因为这是最后一步
      action: (context) => {
        const ethPrice = parseEther(context.price);
        const sendParams = createSendParams({
          vrs: context.signature || {},
          blockNumber: context.blockNumber || 0,
          signatureVersion: 0,
          extraSignature: '0x',
          order: {
            nonce: context.nonce || 0,
            trader: context.accounts[0] as `0x${string}`,
            side: orderSideMap.Buy,
            matchingPolicy: matchingPolicyMap.default,
            nftContract: addressMap.nftContractAddress,
            tokenId: BigInt(10),
            AssetType: assetTypeMap.ERC721,
            amount: BigInt(1),
            paymentToken: zeroAddress,
            price: ethPrice,
            validUntil: context.validUntil || 0,
            createAT: context.createAT || 0,
            fees: [],
            extraParams: '0x',
          },
        });

        return { orderData: sendParams };
      },
      canTransition: (context) => {
        return !!(context.signature && context.blockNumber);
      },
    },

    SUCCESS: {
      name: '订单构建成功，准备撮合交易',
      progress: 100,
      action: async (context) => {
        try {
          // 如果没有挂单数据，说明只是构建订单，不需要撮合
          if (!context.sellOrderData) {
            console.log('买单构建完成，等待挂单数据进行撮合');
            return {};
          }

          // 如果有挂单数据，执行撮合交易
          if (!context.chainId) {
            throw new Error('请选择网络');
          }

          if (!context.orderData) {
            throw new Error('缺少买单数据，无法执行撮合');
          }

          // console.log('开始执行撮合交易...');
          // console.log('sellOrderData=', context.sellOrderData);
          // console.log('buyOrderData=', context.orderData);

          // 调用撮合交易方法
          const result = await executeOrderMatching(
            context.sellOrderData,
            context.orderData,
            context.chainId
          );

          return result;
        } catch (error: any) {
          // 撮合失败不影响订单构建成功，只是记录错误
          return { error: error.message };
        }
      },
      canTransition: (context) => {
        return context.orderData && context.sellOrderData; // 只要有订单数据就可以进入成功状态
      },
    },

    ERROR: {
      name: '订单构建失败',
      progress: 0,
      action: () => ({}),
      canTransition: () => true,
    },
  };

/**
 * 状态转换映射 - 简化流程
 */
export const buyOrderStateTransitions: Record<BuyOrderState, BuyOrderState[]> =
  {
    IDLE: ['CHECKING_FUNDS'],
    CHECKING_FUNDS: ['VALIDATING', 'ERROR'],
    VALIDATING: ['GETTING_TIME', 'ERROR'],
    GETTING_TIME: ['GETTING_NONCE', 'ERROR'],
    GETTING_NONCE: ['CREATING_MESSAGE', 'ERROR'],
    CREATING_MESSAGE: ['SIGNING', 'ERROR'],
    SIGNING: ['BUILDING_ORDER', 'ERROR'],
    BUILDING_ORDER: ['SUCCESS', 'ERROR'],
    SUCCESS: ['IDLE'],
    ERROR: ['IDLE'],
  };
