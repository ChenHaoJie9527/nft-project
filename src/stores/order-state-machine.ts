import { create } from 'zustand';
import {
  type OrderState,
  type OrderStateMachineState,
  stateConfigs,
} from '@/configs/order-state-machine-config';

export const useOrderStateMachineStore = create<OrderStateMachineState>(
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
    },
    progress: 0,
    debugMode: true, // 添加调试模式控制属性

    start: async (params) => {
      const { chainId, accounts, price } = params;

      // 初始化上下文 - 移除 metamaskSDK
      set((state) => ({
        context: { ...state.context, chainId, accounts, price },
        currentState: 'VALIDATING',
        progress: stateConfigs.VALIDATING.progress,
      }));

      // 执行状态机流程
      await executeStateMachine();
    },

    reset: () => {
      set(() => ({
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
        },
        progress: 0,
        debugMode: false, // 重置时也关闭调试模式
      }));
    },

    getCurrentStep: () => {
      const { currentState } = get();
      return stateConfigs[currentState].name;
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

    // 添加调试模式控制方法
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

async function executeStateMachine() {
  const store = useOrderStateMachineStore.getState();

  // 在状态机内部维护自己的 context，确保数据流正确
  let internalContext = { ...store.context };

  // 内部调试方法，可以通过 debugMode 属性控制
  function debugLog(message: string, data?: any) {
    if (!store.debugMode) {
      return;
    } // 如果调试模式关闭，直接返回

    console.log(`[StateMachine] ${message}`);
    console.log(`当前状态: ${store.currentState}`);
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
      const config = stateConfigs[currentState];

      try {
        // 执行当前状态的动作，使用内部的 context
        const result = await config.action(internalContext);

        // 更新内部 context
        internalContext = { ...internalContext, ...result };

        // 同步更新全局 store 的 context
        useOrderStateMachineStore.setState(() => ({
          context: internalContext,
        }));

        // 确定下一个状态
        const nextState = getNextState(currentState, result);
        if (nextState) {
          // 检查下一个状态是否可以转换（使用内部的 context）
          const nextConfig = stateConfigs[nextState];

          if (nextConfig.canTransition(internalContext)) {
            useOrderStateMachineStore.setState((_state) => ({
              currentState: nextState,
              progress: stateConfigs[nextState].progress,
            }));
            currentState = nextState;
            debugLog(`✅ 成功转换到状态: ${nextState}`);
          } else {
            // 如果下一个状态无法转换，抛出错误
            throw new Error(`无法转换到状态 ${nextState}，转换条件不满足`);
          }
        } else {
          // 如果无法确定下一个状态，抛出错误
          throw new Error(`无法从状态 ${currentState} 转换到下一个状态`);
        }
      } catch (actionError) {
        // 如果 action 执行失败，抛出错误让外层 catch 处理
        throw new Error(
          `状态 ${currentState} 执行失败: ${actionError instanceof Error ? actionError.message : '未知错误'}`
        );
      }
    }

    debugLog('🎉 状态机执行完成');
  } catch (error) {
    // 安全地处理 context，避免循环引用问题
    const safeContext = {
      ...internalContext,
      error: error instanceof Error ? error.message : '未知错误',
    };

    debugLog('💥 状态机执行失败', error);

    useOrderStateMachineStore.setState(() => ({
      currentState: 'ERROR',
      context: safeContext,
      progress: 0,
    }));
  }
}

// 获取下一个状态
function getNextState(
  currentState: OrderState,
  result: any
): OrderState | null {
  if (currentState === 'VALIDATING' && !result.error) {
    return 'GETTING_TIME';
  }

  if (currentState === 'GETTING_TIME' && result.chainTime) {
    return 'GETTING_NONCE';
  }

  if (currentState === 'GETTING_NONCE' && result.nonce !== undefined) {
    return 'CREATING_MESSAGE';
  }

  if (currentState === 'CREATING_MESSAGE' && result.typedData) {
    return 'SIGNING';
  }

  if (currentState === 'SIGNING' && result.signature) {
    return 'APPROVING_NFT';
  }

  if (currentState === 'APPROVING_NFT' && !result.error) {
    return 'BUILDING_ORDER';
  }

  if (currentState === 'BUILDING_ORDER' && result.orderData) {
    return 'SUCCESS';
  }

  return null;
}

export const setSignature = (signature: any) => {
  useOrderStateMachineStore.setState((state) => {
    return {
      context: {
        ...state.context,
        signature,
      },
    };
  });
};
