import type { Contract } from 'ethers';

export async function sendApprove(
  contract: Contract,
  toAddress: string,
  tokenId = 10
) {
  try {
    const tx = await contract.approve(toAddress, tokenId);
    const receipt = await tx.wait();
    return receipt;
  } catch (_err) {
    return null;
  }
}
