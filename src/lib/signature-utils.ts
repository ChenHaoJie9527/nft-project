// 签名解析结果类型
export type SignatureResult = {
  v: number;
  r: string;
  s: string;
  signature: string;
};

// 解析个人消息签名
export const parsePersonalSignature = (signature: any): string => {
  try {
    // 暂时返回基本结果
    console.log('signature', signature);
    return signature;
  } catch (error) {
    console.error('解析个人消息签名失败:', error);
    return '';
  }
};

// 获取链名称
export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return '以太坊主网 (Ethereum Mainnet)';
    case 11_155_111:
      return 'Sepolia测试网 (Sepolia Testnet)';
    case 5:
      return 'Goerli测试网 (Goerli Testnet)';
    case 137:
      return 'Polygon主网 (Polygon Mainnet)';
    case 80_001:
      return 'Mumbai测试网 (Polygon Mumbai Testnet)';
    case 56:
      return 'BSC主网 (Binance Smart Chain)';
    case 97:
      return 'BSC测试网 (BSC Testnet)';
    default:
      return `未知网络 (Chain ID: ${chainId})`;
  }
};
