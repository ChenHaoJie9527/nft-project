import { ethers } from 'ethers';
import {
  addressMap,
  assetTypeMap,
  matchingPolicyMap,
  orderSideMap,
} from '@/constants';
import { findAbiByContractName } from '@/lib/abi-utils';
import { assertAbi } from '@/lib/assert-abi';
// import { createContractInstance } from '@/lib/contract-utils';
import { createSendParams } from '@/lib/create-send-params';
import { createEIP712Message } from '@/lib/eip712-utils';
import { getBlockInfo } from '@/lib/get-block-info';
import { getBlockNumber } from '@/lib/get-block-number';
import { getNftOrderNonce } from '@/lib/get-nft-order-nonce';
import { safeAllExists } from '@/lib/utils';
import { useWalletAccountsStore } from '@/stores/wallet-accounts';

/**
 * 购买订单状态机状态
 */
export type BuyOrderState =
  | 'IDLE'
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
  metamaskSDK: any;
  price: string;
  blockNumber: number | null;
  chainTime: bigint | null;
  validUntil: bigint | null;
  createAT: bigint | null;
  nonce: number | null;
  typedData: any | null;
  signature: any | null;
  orderData: any | null;
  error: string | null;
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
      'chainId' | 'accounts' | 'metamaskSDK' | 'price'
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

    VALIDATING: {
      name: '验证钱包和网络',
      progress: 10,
      action: (context) => {
        if (
          !(context.chainId || context.accounts.length || context.metamaskSDK)
        ) {
          return Promise.reject(new Error('钱包或者网络无效'));
        }
        return Promise.resolve({});
      },
      canTransition: (context) => {
        return (
          context.chainId && context.accounts.length && context.metamaskSDK
        );
      },
    },

    GETTING_TIME: {
      name: '获取区块链时间',
      progress: 20,
      action: async (context) => {
        let blockNumber: number | null = null;
        let blockInfo: any = null;
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1000;

        // 重试机制：获取区块号
        while (retryCount < maxRetries && !blockNumber) {
          try {
            blockNumber = await getBlockNumber(context.metamaskSDK);
            if (blockNumber !== null) {
              break;
            }
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
            blockInfo = await getBlockInfo(context.metamaskSDK, blockNumber);
            if (blockInfo !== null) {
              break;
            }
          } catch (_err) {
            console.warn(`获取区块信息失败，第 ${retryCount + 1} 次重试`);
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
        const chainTime = BigInt(
          blockInfo.timestamp ?? Math.floor(Date.now() / 1000)
        );

        // 订单有效期
        const validUntil = chainTime + BigInt(3600);

        // 创建订单时间
        const createAT = chainTime;

        return Promise.resolve({
          blockNumber,
          chainTime,
          validUntil,
          createAT,
        });
      },
      canTransition: (context) => {
        return (
          context.chainId && context.accounts.length && context.metamaskSDK
        );
      },
    },

    GETTING_NONCE: {
      name: '获取合约Nonce',
      progress: 30,
      action: async (context) => {
        try {
          const nftOrder = findAbiByContractName('nft-order-manager');
          if (!nftOrder) {
            throw new Error('找不到合约ABI');
          }

          const nftOrderContract = await createContractInstance(
            context.metamaskSDK,
            {
              chainId: context.chainId || 0,
              abi: assertAbi(nftOrder),
              contractAddress: addressMap.contractAddress,
            }
          );
          if (!nftOrderContract) {
            throw new Error('合约实例创建失败');
          }

          const nonce = await getNftOrderNonce(
            nftOrderContract,
            context.accounts
          );
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
        const ethPrice = ethers.parseEther(context.price);
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
        const { signEIP712 } = useWalletAccountsStore.getState();

        if (!context.typedData) {
          throw new Error('缺少typedData，无法进行签名');
        }

        try {
          const signature = await signEIP712(context.typedData);
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
      progress: 90,
      action: (context) => {
        const ethPrice = ethers.parseEther(context.price);
        const sendParams = createSendParams({
          vrs: context.signature || {},
          blockNumber: context.blockNumber || 0,
          signatureVersion: 0,
          extraSignature: '0x',
          order: {
            nonce: context.nonce || 0,
            trader: context.accounts[0] as `0x${string}`,
            side: orderSideMap.Buy, // 买单
            matchingPolicy: matchingPolicyMap.default,
            nftContract: addressMap.nftContractAddress,
            tokenId: BigInt(10), // 与卖单一致
            AssetType: assetTypeMap.ERC721,
            amount: BigInt(1),
            paymentToken: ethers.ZeroAddress,
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
      name: '订单提交成功',
      progress: 100,
      action: () => ({}),
      canTransition: () => true,
    },

    ERROR: {
      name: '订单提交失败',
      progress: 0,
      action: () => ({}),
      canTransition: () => true,
    },
  };

/**
 * 状态转换映射
 */
export const buyOrderStateTransitions: Record<BuyOrderState, BuyOrderState[]> =
  {
    IDLE: ['VALIDATING'],
    VALIDATING: ['GETTING_TIME', 'ERROR'],
    GETTING_TIME: ['GETTING_NONCE', 'ERROR'],
    GETTING_NONCE: ['CREATING_MESSAGE', 'ERROR'],
    CREATING_MESSAGE: ['SIGNING', 'ERROR'],
    SIGNING: ['BUILDING_ORDER', 'ERROR'],
    BUILDING_ORDER: ['SUCCESS', 'ERROR'],
    SUCCESS: ['IDLE'],
    ERROR: ['IDLE'],
  };
