import type { SendParams } from '@/types';

export function createSendParams({
  vrs,
  order,
  blockNumber,
  signatureVersion = 0,
  extraSignature = '0x',
}: SendParams) {
  const params = {
    order,
    v: vrs.v,
    r: vrs.r,
    s: vrs.s,
    blockNumber,
    signatureVersion,
    extraSignature,
  };

  return params;
}
