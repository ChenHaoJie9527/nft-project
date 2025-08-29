import { useCallback, useSyncExternalStore } from 'react';
import { useClient } from './use-client';
import { useClientEffect } from './use-client-effect';

// 定义存储事件的类型
type StorageEvent = {
  key: string;
  newValue: string | null;
};

// 定义 setState 函数的类型
type SetStateAction<T> = T | ((prev: T) => T);

// 定义 hook 返回值的类型
type UseLocalStorageReturn<T> = [T, (value: SetStateAction<T>) => void];

// BigInt 序列化辅助函数
const serializeValue = (value: unknown): string => {
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === 'bigint') {
      return { __type: 'BigInt', value: val.toString() };
    }
    return val;
  });
};

// BigInt 反序列化辅助函数
const deserializeValue = (value: string): unknown => {
  return JSON.parse(value, (_key, val) => {
    if (val && typeof val === 'object' && val.__type === 'BigInt') {
      return BigInt(val.value);
    }
    return val;
  });
};

// 分发存储事件，用于跨标签页同步
const dispatchStorageEvent = (key: string, newValue: string | null) => {
  window.dispatchEvent(
    new StorageEvent('storage', {
      key,
      newValue,
    })
  );
};

const setLocalStorageItem = (key: string, value: unknown): void => {
  try {
    const stringifiedValue = serializeValue(value);
    window.localStorage.setItem(key, stringifiedValue);
    dispatchStorageEvent(key, stringifiedValue);
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

const removeLocalStorageItem = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
    dispatchStorageEvent(key, null);
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
};

const getLocalStorageItem = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return null;
  }
};

const useLocalStorageSubscribe = (callback: (event: StorageEvent) => void) => {
  window.addEventListener('storage', (event) => {
    if (event.key) {
      callback(event as StorageEvent);
    }
  });
  return () =>
    window.removeEventListener('storage', (event) => {
      if (event.key) {
        callback(event as StorageEvent);
      }
    });
};

const getLocalStorageServerSnapshot = (): null => {
  // 在服务器端返回 null，避免抛出错误
  return null;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const isClient = useClient();

  const getSnapshot = (): string | null => {
    if (!isClient) {
      return null;
    }
    return getLocalStorageItem(key);
  };

  const store = useSyncExternalStore(
    useLocalStorageSubscribe,
    getSnapshot,
    getLocalStorageServerSnapshot
  );

  const setState = useCallback(
    (value: SetStateAction<T>) => {
      if (!isClient) {
        return;
      }

      try {
        const currentValue = store ? deserializeValue(store) : initialValue;
        const nextState =
          typeof value === 'function'
            ? (value as (prev: T) => T)(currentValue as T)
            : value;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    },
    [key, store, initialValue, isClient]
  );

  useClientEffect(() => {
    if (
      getLocalStorageItem(key) === null &&
      typeof initialValue !== 'undefined'
    ) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  // 解析存储的值，如果解析失败则返回初始值
  const parsedValue = (() => {
    if (!isClient) {
      return initialValue;
    }
    if (!store) {
      return initialValue;
    }
    try {
      return deserializeValue(store) as T;
    } catch (error) {
      console.error('Error parsing localStorage value:', error);
      return initialValue;
    }
  })();

  return [parsedValue, setState];
}

export type { UseLocalStorageReturn, SetStateAction };
