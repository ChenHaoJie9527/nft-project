/**
 * 地址映射
 * @description 地址映射
 * 1. contractAddress: 智能合约地址
 * 2. approveAddress: 智能合约Approve授权地址
 */
export const addressMap = {
  // 智能合约地址
  contractAddress: '0x4c85004Ef5c4124E8acEf182700B4aec971974b1',

  // 智能合约Approve授权地址
  approveAddress: '0x8c35EbA1A0543737626425abC778368D82902E24',

  // NFT合约地址
  nftContractAddress: '0xf717d1C73fc93452E067f2288542604A12295900',

  // 资金池合约地址
  ethPoolAddress: '0xD7E3A8C772088bc1728f1fdA08a8e07DCd4d479a',
} as const;

/**
 * 资产类型
 * 0: ERC721
 * 1: ERC1155
 */
export const assetTypeMap = {
  ERC721: 0,
  ERC1155: 1,
} as const;

/**
 * 策略地址
 * @description 策略地址
 * default: 默认策略地址
 */
export const matchingPolicyMap = {
  default: '0x245ed3Cc6c3A64c04A4f01e630Cca450Bacf99cE',
  ethPool: '0xA3FDDC2025fC17e4a0B7b16AF5F7423859427607',
} as const;

/**
 * 订单方向
 * 0: 卖出
 * 1: 买入
 */
export const orderSideMap = {
  Sell: 0,
  Buy: 1,
} as const;

/**
 * 0 补全正则
 */
export const ZERO_REGEX = /0+$/;
