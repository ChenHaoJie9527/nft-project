// 签名解析结果类型
export type SignatureResult = {
  v: number;
  r: string;
  s: string;
  signature: string;
};

// 解析签名获取r、s、v值
function parseSignature(signature: string) {
  let newSignature = signature;
  // 确保签名以0x开头
  if (newSignature.startsWith('0x')) {
    newSignature = newSignature.slice(2);
  }

  // 以太坊签名长度应为65字节 (130个十六进制字符)
  if (newSignature.length !== 130) {
    throw new Error(
      `无效的签名长度: 预期130个字符，实际${newSignature.length}个`
    );
  }

  // 解析r、s、v
  const r = `0x${newSignature.substring(0, 64)}`; // 前32字节 (64个字符)
  const s = `0x${newSignature.substring(64, 128)}`; // 接下来32字节 (64个字符)
  const v = Number.parseInt(newSignature.substring(128, 130), 16); // 最后1字节 (2个字符)

  return { v, r, s, signature };
}

// 解析EIP712签名（使用 ethers.js 或其他库）
export const parseEIP712Signature = (
  signature: string
): SignatureResult | null => {
  try {
    return parseSignature(signature);
  } catch (error) {
    console.error('解析EIP712签名失败:', error);
    return null;
  }
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

// 格式化签名信息用于显示
export const formatSignatureInfo = (result: SignatureResult) => {
  return {
    r: result.r,
    s: result.s,
    v: result.v,
  };
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
