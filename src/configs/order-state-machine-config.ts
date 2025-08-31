import { ethers } from 'ethers';
import {
  addressMap,
  assetTypeMap,
  matchingPolicyMap,
  orderSideMap,
} from '@/constants';
import { findAbiByContractName } from '@/lib/abi-utils';
import { assertAbi } from '@/lib/assert-abi';
import { createContractInstance } from '@/lib/contract-utils';
import { createSendParams } from '@/lib/create-send-params';
import { createEIP712Message } from '@/lib/eip712-utils';
import { getBlockInfo } from '@/lib/get-block-info';
import { getBlockNumber } from '@/lib/get-block-number';
import { getNftOrderNonce } from '@/lib/get-nft-order-nonce';
import { sendApprove } from '@/lib/send-approve';
import { safeAllExists } from '@/lib/utils';
import { useWalletAccountsStore } from '@/stores/wallet-accounts';

/**
 * 订单状态
 */
export type OrderState =
  | 'IDLE'
  | 'VALIDATING'
  | 'GETTING_TIME'
  | 'GETTING_NONCE'
  | 'CREATING_MESSAGE'
  | 'SIGNING'
  | 'APPROVING_NFT'
  | 'BUILDING_ORDER'
  | 'SUCCESS'
  | 'ERROR';

/**
 * 状态机上下文数据
 */
type OrderContext = {
  chainId: number | null; // 链ID
  accounts: string[]; // 账户列表
  metamaskSDK: any; // MetaMask SDK
  price: string; // 价格
  blockNumber: number | null; // 区块号
  chainTime: bigint | null; // 链时间
  validUntil: bigint | null; // 有效期
  createAT: bigint | null; // 创建时间
  nonce: number | null; // nonce值
  typedData: any | null; // 类型化数据
  signature: any | null; // 签名
  orderData: any | null; // 订单数据
  error: string | null; // 错误信息
};

/**
 * 状态机配置
 */
type StateConfig = {
  name: string; // 状态名称
  progress: number; // 进度
  action: (
    context: OrderContext
  ) => Promise<Partial<OrderContext>> | Partial<OrderContext>; // 动作
  canTransition: (context: OrderContext) => boolean; // 是否可以转换
};

type ActionParams = Pick<
  OrderContext,
  'chainId' | 'accounts' | 'metamaskSDK' | 'price'
>;

type Action = (params: ActionParams) => Promise<any>;

type Reset = () => void;

type GetCurrentStep = () => string;

type GetProgressPercentage = () => number;

type IsInState = (state: OrderState) => boolean;

type GetContext = () => OrderContext;

export type OrderStateMachineState = {
  // 状态机状态信息
  currentState: OrderState;
  context: OrderContext;
  progress: number;

  debugMode: boolean;

  // 状态机核心方法
  start: Action;
  reset: Reset;
  getCurrentStep: GetCurrentStep;
  getProgressPercentage: GetProgressPercentage;

  // 状态查询
  isInState: IsInState;
  getContext: GetContext;
};

/**
 * 状态配置映射
 */
export const stateConfigs: Record<OrderState, StateConfig> = {
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
        !(context.chainId || context.accounts.length || context.metamaskSDK)
      ) {
        return Promise.reject(new Error('钱包或者网络无效'));
      }
      return Promise.resolve({});
    },
    canTransition: (context) => {
      return context.chainId && context.accounts.length && context.metamaskSDK;
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
      const retryDelay = 1000; // 1秒

      // 重试机制：获取区块号
      while (retryCount < maxRetries && !blockNumber) {
        try {
          blockNumber = await getBlockNumber(context.metamaskSDK);

          if (blockNumber !== null) {
            break;
          }
        } catch (error) {
          console.warn(`获取区块号失败，第 ${retryCount + 1} 次:`, error);
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
      const chainTime = BigInt(
        blockInfo?.timestamp ?? Math.floor(Date.now() / 1000)
      );

      // 计算有效期
      const validUntil = chainTime + BigInt(3600);

      // 计算创建时间
      const createAT = chainTime;

      const result = {
        blockNumber,
        chainTime,
        validUntil,
        createAT,
      };
      return result;
    },
    canTransition: (context) => {
      return context.chainId && context.accounts.length && context.metamaskSDK;
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
          throw new Error('无法获取合约 ABI');
        }

        // 2. 创建合约实例
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

        // 3. 获取 nonce

        const nonce = await getNftOrderNonce(
          nftOrderContract,
          context.accounts
        );

        if (nonce === null) {
          throw new Error('获取合约Nonce失败');
        }

        return Promise.resolve({ nonce });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    canTransition: (context) => !!(context.blockNumber && context.chainTime),
  },
  CREATING_MESSAGE: {
    name: '创建签名信息',
    progress: 40,
    action: (context) => {
      const ethPrice = ethers.parseEther(context.price);
      const typedData = createEIP712Message.nftMint({
        chainId: context.chainId || 0,
        contractAddress: addressMap.contractAddress,
        order: {
          to: context.accounts[0] as `0x${string}`,
          tokenId: 10,
          nonce: context.nonce || 0,
          side: 0,
          matchingPolicy: matchingPolicyMap.default,
          nftContract: addressMap.nftContractAddress,
          price: ethPrice.toString(),
          validUntil: context.validUntil?.toString(),
          createAT: context.createAT?.toString(),
          fees: [],
          extraParams: '0x',
        },
      });

      return Promise.resolve({
        typedData,
      });
    },

    canTransition: (context) => {
      // 使用工具函数：将 BigInt(0) 视为有效值
      const result = safeAllExists(
        context.nonce,
        context.validUntil,
        context.createAT
      );

      return result;
    },
  },

  SIGNING: {
    name: '等待用户签名',
    progress: 50,
    action: async (context) => {
      const { signEIP712 } = useWalletAccountsStore.getState();
      if (!context.typedData) {
        throw new Error('缺少typedData，无法进行签名');
      }
      try {
        const signature = await signEIP712(context.typedData);
        return Promise.resolve({ signature });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    canTransition: (context) => {
      return !!context.typedData;
    },
  },

  APPROVING_NFT: {
    name: '授权NFT合约',
    progress: 70,
    action: async (context) => {
      const erc721Abi = findAbiByContractName('721');
      const contract = await createContractInstance(context.metamaskSDK, {
        contractAddress: addressMap.nftContractAddress,
        abi: assertAbi(erc721Abi),
        chainId: context.chainId || 0,
      });

      if (contract) {
        const receiptResult = await sendApprove(
          contract,
          addressMap.approveAddress
        );

        if (!receiptResult) {
          return Promise.reject(new Error('授权NFT合约失败'));
        }

        return Promise.resolve({});
      }

      return Promise.resolve({});
    },
    canTransition: (context) => !!context.signature,
  },

  BUILDING_ORDER: {
    name: '构建卖单数据',
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
          side: orderSideMap.Sell,
          matchingPolicy: matchingPolicyMap.default,
          nftContract: addressMap.nftContractAddress,
          tokenId: BigInt(10),
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
      return {
        orderData: sendParams,
      };
    },

    canTransition: (context) => !!(context.signature && context.blockNumber),
  },

  SUCCESS: {
    name: '挂单成功',
    progress: 100,
    action: async () => ({}),
    canTransition: () => true,
  },

  ERROR: {
    name: '操作失败',
    action: async () => ({}),
    canTransition: () => true,
    progress: 0,
  },
};

export const stateTransitions: Record<OrderState, OrderState[]> = {
  IDLE: ['VALIDATING'],
  VALIDATING: ['GETTING_TIME', 'ERROR'],
  GETTING_TIME: ['GETTING_NONCE', 'ERROR'],
  GETTING_NONCE: ['CREATING_MESSAGE', 'ERROR'],
  CREATING_MESSAGE: ['SIGNING', 'ERROR'],
  SIGNING: ['APPROVING_NFT', 'ERROR'],
  APPROVING_NFT: ['BUILDING_ORDER', 'ERROR'],
  BUILDING_ORDER: ['SUCCESS', 'ERROR'],
  SUCCESS: ['IDLE'],
  ERROR: ['IDLE'],
};
