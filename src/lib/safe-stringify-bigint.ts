// 添加一个安全的 JSON 序列化函数，处理 BigInt
export const safeStringify = (obj: any, space?: number): string => {
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === 'bigint') {
        return `${value}n`; // 添加 'n' 后缀表示 BigInt
      }
      return value;
    },
    space
  );
};
