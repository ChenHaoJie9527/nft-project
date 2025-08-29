import type { ABI } from '@/types';

export function assertAbi(value: unknown): ABI {
  if (Array.isArray(value)) {
    return value as unknown as ABI;
  }
  throw new Error('Invalid ABI format');
}
