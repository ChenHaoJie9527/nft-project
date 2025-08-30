import { ZERO_REGEX } from '@/constants';

export const formatBigInt = (
  value: bigint | string | number,
  decimals = 18
): string => {
  try {
    const bigIntValue = typeof value === 'bigint' ? value : BigInt(value);
    const divisor = BigInt(10 ** decimals);
    const integerPart = bigIntValue / divisor;
    const decimalPart = bigIntValue % divisor;

    if (decimalPart === BigInt(0)) {
      return integerPart.toString();
    }

    const decimalString = decimalPart.toString().padStart(decimals, '0');
    // 移除尾部的零
    const trimmedDecimal = decimalString.replace(ZERO_REGEX, '');
    return `${integerPart}.${trimmedDecimal}`;
  } catch (_err) {
    return value.toString();
  }
};
