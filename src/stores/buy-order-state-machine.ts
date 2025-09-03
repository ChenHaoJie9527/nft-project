import { create } from 'zustand';
import {
  type BuyOrderState,
  type BuyOrderStateMachineState,
  buyOrderStateConfigs,
} from '@/configs/buy-order-state-machine-config';

export const useBuyOrderStateMachineStore = create<BuyOrderStateMachineState>(
  (set, get) => ({
    currentState: 'IDLE',
    context: {
      chainId: null,
      accounts: [],
      price: '',
      blockNumber: null,
      chainTime: null,
      validUntil: null,
      createAT: null,
      nonce: null,
      typedData: null,
      signature: null,
      orderData: null,
      error: null,
      hasEnoughFunds: false,
      transactionHash: null,
      transactionStatus: null,
      sellOrderData: null,
    },
    progress: 0,
    debugMode: true,

    start: async (params) => {
      const { chainId, accounts, price, sellOrderData } = params;

      set((state) => ({
        context: { ...state.context, chainId, accounts, price, sellOrderData },
        currentState: 'CHECKING_FUNDS',
        progress: buyOrderStateConfigs.CHECKING_FUNDS.progress,
      }));

      await executeBuyOrderStateMachine();
    },

    reset: () => {
      set(() => ({
        currentState: 'IDLE',
        context: {
          chainId: null,
          accounts: [],
          hasEnoughFunds: false,
          transactionHash: null,
          transactionStatus: null,
          price: '',
          blockNumber: null,
          chainTime: null,
          validUntil: null,
          createAT: null,
          nonce: null,
          typedData: null,
          signature: null,
          orderData: null,
          error: null,
          sellOrderData: null,
        },
        progress: 0,
        debugMode: true,
      }));
    },

    getCurrentStep: () => {
      const { currentState } = get();
      return buyOrderStateConfigs[currentState].name;
    },

    getProgressPercentage: () => {
      return get().progress;
    },

    isInState: (state) => {
      return get().currentState === state;
    },

    getContext: () => {
      return get().context;
    },

    enableDebug: () => {
      set({ debugMode: true });
    },

    disableDebug: () => {
      set({ debugMode: false });
    },

    toggleDebug: () => {
      set((state) => ({ debugMode: !state.debugMode }));
    },
  })
);

async function executeBuyOrderStateMachine() {
  const store = useBuyOrderStateMachineStore.getState();
  let internalContext = { ...store.context };

  function debugLog(message: string, data?: any) {
    if (!store.debugMode) {
      return;
    }

    console.log(`[BuyOrderStateMachine] ${message}`);
    console.log('上下文信息:', {
      chainId: internalContext.chainId,
      price: internalContext.price,
      accounts: internalContext.accounts?.length || 0,
      nonce: internalContext.nonce,
      blockNumber: internalContext.blockNumber,
      chainTime: internalContext.chainTime,
      hasTypedData: !!internalContext.typedData,
      hasSignature: !!internalContext.signature,
      hasOrderData: !!internalContext.orderData,
      error: internalContext.error,
    });

    if (data) {
      console.log('额外数据:', data);
    }
    console.log('---');
  }

  try {
    let currentState = store.currentState;

    while (currentState !== 'SUCCESS' && currentState !== 'ERROR') {
      const config = buyOrderStateConfigs[currentState];

      try {
        const result = await config.action(internalContext);
        internalContext = { ...internalContext, ...result };

        useBuyOrderStateMachineStore.setState(() => ({
          context: internalContext,
        }));

        const nextState = getNextBuyOrderState(currentState, result);
        if (nextState) {
          const nextConfig = buyOrderStateConfigs[nextState];

          if (nextConfig.canTransition(internalContext)) {
            useBuyOrderStateMachineStore.setState((_state) => ({
              currentState: nextState,
              progress: buyOrderStateConfigs[nextState].progress,
            }));
            currentState = nextState;
            debugLog(`✅ 成功转换到状态: ${nextState}`);
          } else {
            throw new Error(`无法转换到状态 ${nextState}，转换条件不满足`);
          }
        } else {
          throw new Error(`无法从状态 ${currentState} 转换到下一个状态`);
        }
      } catch (actionError) {
        throw new Error(
          `状态 ${currentState} 执行失败: ${actionError instanceof Error ? actionError.message : '未知错误'}`
        );
      }
    }

    // 处理 SUCCESS 状态
    if (currentState === 'SUCCESS') {
      const config = buyOrderStateConfigs[currentState];
      const result = await config.action(internalContext);
      internalContext = { ...internalContext, ...result };

      useBuyOrderStateMachineStore.setState(() => ({
        context: internalContext,
      }));
    }

    debugLog('🎉 买单状态机执行完成');
  } catch (error) {
    const safeContext = {
      ...internalContext,
      error: error instanceof Error ? error.message : '未知错误',
    };

    debugLog('💥 买单状态机执行失败', error);

    useBuyOrderStateMachineStore.setState(() => ({
      currentState: 'ERROR',
      context: safeContext,
      progress: 0,
    }));
  }
}

function getNextBuyOrderState(
  currentState: BuyOrderState,
  result: any
): BuyOrderState | null {
  // 从 IDLE 开始
  if (currentState === 'IDLE') {
    return 'CHECKING_FUNDS';
  }

  // 检查资金后进入验证状态
  if (currentState === 'CHECKING_FUNDS' && result.hasEnoughFunds !== null) {
    return 'VALIDATING';
  }

  // 验证后获取时间
  if (currentState === 'VALIDATING' && !result.error) {
    return 'GETTING_TIME';
  }

  // 获取时间后获取 nonce
  if (currentState === 'GETTING_TIME' && result.chainTime) {
    return 'GETTING_NONCE';
  }

  // 获取 nonce 后创建消息
  if (currentState === 'GETTING_NONCE' && result.nonce !== undefined) {
    return 'CREATING_MESSAGE';
  }

  // 创建消息后进入签名
  if (currentState === 'CREATING_MESSAGE' && result.typedData) {
    return 'SIGNING';
  }

  // 签名后构建订单
  if (currentState === 'SIGNING' && result.signature) {
    return 'BUILDING_ORDER';
  }

  // 构建订单后进入成功状态
  if (currentState === 'BUILDING_ORDER' && result.orderData) {
    return 'SUCCESS';
  }

  return null;
}

export const setBuyOrderSignature = (signature: any) => {
  useBuyOrderStateMachineStore.setState((state) => {
    return {
      context: {
        ...state.context,
        signature,
      },
    };
  });
};
