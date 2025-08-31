export async function getNftOrderNonce(
  contract: any,
  accounts: any[]
): Promise<number | null> {
  if (!contract) {
    return null;
  }

  try {
    // 首先尝试getNonce方法
    try {
      const nonce = await contract.getNonce();
      return nonce;
    } catch (_getNonceError) {
      // 备用方案：从nonces映射获取当前用户的nonce
      if (accounts?.[0]) {
        try {
          const userNonce = await contract.nonces(accounts[0]);
          return userNonce;
        } catch (_noncesError) {
          return null;
        }
      }

      return null;
    }
  } catch (_err) {
    return null;
  }
}
