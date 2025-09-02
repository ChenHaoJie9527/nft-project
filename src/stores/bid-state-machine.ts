import { create } from 'zustand';
import {
  type BidState,
  type BidStateMachineState,
  bidStateConfigs,
} from '@/configs/bid-state-machine-config';

export const useBidStateMachineStore = create<BidStateMachineState>(
  (set, get) => ({
    currentState: 'IDLE',
    context: {
      chainId: null,
      accounts: [],
      collectionAddress: '',
      bidPrice: '',
      blockNumber: null,
      chainTime: null,
      validUntil: null,
      createAT: null,
      nonce: null,
      typedData: null,
      signature: null,
      balance: null,
      error: null,
      needsDeposit: false,
      requiredAmount: BigInt(0),
      depositAmount: BigInt(0),
      depositCompleted: false,
    },
    progress: 0,
    debugMode: true,

    start: async (params) => {
      const { chainId, accounts, collectionAddress, bidPrice } = params;
      set((state) => ({
        context: {
          ...state.context,
          chainId,
          accounts,
          collectionAddress,
          bidPrice,
        },
        currentState: 'VALIDATING',
        progress: bidStateConfigs.VALIDATING.progress,
      }));

      // 执行状态机流程
      await executeBidStateMachine();
    },

    reset: () => {
      set(() => ({
        currentState: 'IDLE',
        context: {
          chainId: null,
          accounts: [],
          collectionAddress: '',
          bidPrice: '',
          blockNumber: null,
          chainTime: null,
          validUntil: null,
          createAT: null,
          nonce: null,
          typedData: null,
          signature: null,
          balance: null,
          error: null,
          needsDeposit: false,
          requiredAmount: BigInt(0),
          depositAmount: BigInt(0),
          depositCompleted: false,
        },
        progress: 0,
        debugMode: false,
      }));
    },

    getCurrentStep: () => {
      const { currentState } = get();
      return bidStateConfigs[currentState].name;
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

async function executeBidStateMachine() {
  const store = useBidStateMachineStore.getState();

  // 在状态机内部维护自己的 context，确保数据流正确
  let internalContext = { ...store.context };

  // 内部调试方法，可以通过 debugMode 属性控制
  function debugLog(message: string, data?: any) {
    if (!store.debugMode) {
      return;
    }

    console.log(`[BidStateMachine] ${message}`);
    console.log('上下文信息:', {
      chainId: internalContext.chainId,
      bidPrice: internalContext.bidPrice,
      collectionAddress: internalContext.collectionAddress,
      accounts: internalContext.accounts?.length || 0,
      balance: internalContext.balance,
      nonce: internalContext.nonce,
      blockNumber: internalContext.blockNumber,
      chainTime: internalContext.chainTime,
      hasTypedData: !!internalContext.typedData,
      hasSignature: !!internalContext.signature,
      error: internalContext.error,
    });

    if (data) {
      console.log('额外数据:', data);
    }
    console.log('--------------------------------');
  }

  try {
    let currentState = store.currentState;

    while (currentState !== 'SUCCESS' && currentState !== 'ERROR') {
      const config = bidStateConfigs[currentState];

      try {
        // 执行当前状态的动作，使用内部的 context
        const result = await config.action(internalContext);

        // 更新内部 context
        internalContext = { ...internalContext, ...result };

        // 同步更新全局 store 的 context
        useBidStateMachineStore.setState(() => ({
          context: internalContext,
        }));

        // 确定下一个状态
        const nextState = getNextBidState(currentState, result);
        if (nextState) {
          // 检查下一个状态是否可以转换（使用内部的 context）
          const nextConfig = bidStateConfigs[nextState];

          if (nextConfig.canTransition(internalContext)) {
            useBidStateMachineStore.setState((_state) => ({
              currentState: nextState,
              progress: bidStateConfigs[nextState].progress,
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

    debugLog('🎉 出价状态机执行完成');
  } catch (error) {
    // 安全地处理 context，避免循环引用问题
    const safeContext = {
      ...internalContext,
      error: error instanceof Error ? error.message : '未知错误',
    };

    debugLog('💥 出价状态机执行失败', error);

    useBidStateMachineStore.setState(() => ({
      currentState: 'ERROR',
      context: safeContext,
      progress: 0,
    }));
  }
}

// 修改获取下一个出价状态的函数
function getNextBidState(currentState: BidState, result: any): BidState | null {
  if (currentState === 'VALIDATING' && !result.error) {
    return 'CHECKING_BALANCE';
  }

  if (currentState === 'CHECKING_BALANCE') {
    if (result.needsDeposit) {
      return 'DEPOSITING_ETH'; // 需要充值
    }
    return 'GETTING_TIME'; // 余额充足，继续流程
  }

  if (currentState === 'DEPOSITING_ETH' && result.depositCompleted) {
    return 'RE_CHECKING_BALANCE'; // 充值完成，重新检查余额
  }

  if (currentState === 'RE_CHECKING_BALANCE' && result.balance) {
    return 'GETTING_TIME'; // 重新检查余额成功，继续流程
  }

  if (currentState === 'GETTING_TIME' && result.chainTime) {
    return 'GETTING_NONCE';
  }

  if (currentState === 'GETTING_NONCE' && result.nonce !== undefined) {
    return 'CREATING_BID_MESSAGE';
  }

  if (currentState === 'CREATING_BID_MESSAGE' && result.typedData) {
    return 'SIGNING_BID';
  }

  if (currentState === 'SIGNING_BID' && result.signature) {
    return 'APPROVING_PAYMENT_TOKEN';
  }

  if (currentState === 'APPROVING_PAYMENT_TOKEN' && !result.error) {
    return 'SUBMITTING_BID';
  }

  if (currentState === 'SUBMITTING_BID' && !result.error) {
    return 'SUCCESS';
  }

  return null;
}

// 外部设置签名的方法
export const setBidSignature = (signature: any) => {
  useBidStateMachineStore.setState((state) => {
    return {
      context: {
        ...state.context,
        signature,
      },
    };
  });
};
