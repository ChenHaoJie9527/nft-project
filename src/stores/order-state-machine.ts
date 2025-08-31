import { create } from 'zustand';
import {
  type OrderState,
  type OrderStateMachineState,
  stateConfigs,
  stateTransitions,
} from '@/configs/order-state-machine-config';

export const useOrderStateMachineStore = create<OrderStateMachineState>(
  (set, get) => ({
    currentState: 'IDLE',
    context: {
      chainId: null,
      accounts: [],
      metamaskSDK: null,
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

    start: async (params) => {
      const { chainId, accounts, metamaskSDK, price } = params;

      // 初始化上下文
      set((state) => ({
        context: { ...state.context, chainId, accounts, metamaskSDK, price },
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
          metamaskSDK: null,
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
  })
);

async function executeStateMachine() {
  // 直接使用 store 的方法
  const store = useOrderStateMachineStore.getState();

  try {
    let currentState = store.currentState;

    while (currentState !== 'SUCCESS' && currentState !== 'ERROR') {
      const config = stateConfigs[currentState];

      // 检查是否可以转换到下一个状态
      if (!config.canTransition(store.context)) {
        throw new Error(`状态 ${currentState} 的转换条件不满足`);
      }

      // 执行当前状态的动作
      const result = await config.action(store.context);

      // 更新上下文
      useOrderStateMachineStore.setState((state) => ({
        context: { ...state.context, ...result },
      }));

      // 确定下一个状态
      const nextState = getNextState(currentState, result);
      if (nextState) {
        useOrderStateMachineStore.setState((_state) => ({
          currentState: nextState,
          progress: stateConfigs[nextState].progress,
        }));
        currentState = nextState;
      } else {
        break;
      }

      // 特殊处理：SIGNING 状态需要外部输入
      if (currentState === 'SIGNING') {
        break; // 等待外部调用 setSignature
      }
    }
  } catch (error) {
    useOrderStateMachineStore.setState((state) => ({
      currentState: 'ERROR',
      context: {
        ...state.context,
        error: error instanceof Error ? error.message : '未知错误',
      },
      progress: 0,
    }));
  }
}

// 获取下一个状态
function getNextState(
  currentState: OrderState,
  result: any
): OrderState | null {
  const transitions = stateTransitions[currentState];
  if (!transitions) {
    return null;
  }
  if (currentState === 'VALIDATING' && !result.error) {
    // 根据结果和当前状态确定下一个状态
    return 'GETTING_TIME';
  }

  if (currentState === 'GETTING_TIME' && result.chainTime) {
    return 'GETTING_NONCE';
  }
  if (currentState === 'GETTING_NONCE' && result.nonce) {
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
  return 'ERROR';
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
