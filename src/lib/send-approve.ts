import type { Contract } from 'ethers';

export async function sendApprove(
  contract: Contract,
  toAddress: string,
  tokenId = 10
) {
  try {
    if (contract) {
      console.log('正在授权NFT给合约:', toAddress);
      const tx = await contract.approve(toAddress, tokenId);
      console.log('授权交易已发送:', tx.hash);
      const receipt = await tx.wait();
      console.log('授权交易确认:', receipt);
      return receipt;
    }
  } catch (err) {
    console.log('approve调用失败', err);
    return null;
  }
}
