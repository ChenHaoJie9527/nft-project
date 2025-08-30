export const formatTimestamp = (timestamp: bigint | number): string => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('zh-CN');
};
