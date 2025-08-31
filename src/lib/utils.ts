import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 安全地序列化对象，避免循环引用错误
 * @param obj 要序列化的对象
 * @returns 安全的对象副本
 */
export function safeSerialize<T>(obj: T): T {
  try {
    // 尝试 JSON 序列化来检测循环引用
    JSON.stringify(obj);
    return obj;
  } catch (error) {
    if (error instanceof Error && error.message.includes('circular')) {
      // 如果检测到循环引用，创建一个安全的副本
      const safeObj = { ...obj } as any;

      // 移除可能导致循环引用的属性
      if (safeObj.metamaskSDK) {
        safeObj.metamaskSDK = '[MetaMaskSDK Object]';
      }

      return safeObj;
    }
    return obj;
  }
}

/**
 * 安全地获取对象的字符串表示
 * @param obj 要转换的对象
 * @returns 安全的字符串表示
 */
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    if (error instanceof Error && error.message.includes('circular')) {
      // 如果检测到循环引用，返回安全的表示
      const safeObj = safeSerialize(obj);
      return JSON.stringify(safeObj, null, 2);
    }
    return '[无法序列化的对象]';
  }
}

/**
 * 安全地检查值是否存在（将 BigInt(0) 视为有效值）
 * @param value 要检查的值
 * @returns 如果值存在（包括 0n）返回 true，否则返回 false
 */
export function safeExists(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  // 特殊处理 BigInt(0)
  if (typeof value === 'bigint') {
    return true; // BigInt(0) 也是有效值
  }

  // 其他类型的 truthy 检查
  return !!value;
}

/**
 * 检查多个值是否都存在（将 BigInt(0) 视为有效值）
 * @param values 要检查的值数组
 * @returns 如果所有值都存在返回 true，否则返回 false
 */
export function safeAllExists(...values: any[]): boolean {
  return values.every((value) => safeExists(value));
}
