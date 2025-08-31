export async function getNftOrderNonce(
  contract: any,
  accounts: any[]
): Promise<number | null> {
  if (!contract) {
    return null;
  }

  try {
    try {
      return await contract.getNonce();
    } catch {
      // 备用方案：从nonces映射获取
      return await contract.nonces(accounts[0]);
    }
  } catch {
    return null;
  }
}
