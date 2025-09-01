# Release v0.2.0 - Rainbowkit钱包集成与架构重构

## 🎯 版本概述
这是一个重要的架构重构版本，完成了从Metamask到Rainbowkit的钱包系统迁移，重构了合约交互层，并完成了撮合交易系统的优化。

## 🚀 主要功能

### 1. Rainbowkit钱包集成
- ✅ 接入Rainbowkit钱包插件
- ✅ 配置Rainbowkit provider适配器
- ✅ 支持自动发现浏览器钱包扩展
- ✅ 重构钱包连接相关组件

### 2. 数据层架构优化
- ✅ 创建QueryProvider作为数据提取和缓存层
- ✅ 完善wagmi配置
- ✅ 重构provider结构，提升代码组织性

### 3. 合约交互重构
- ✅ 重构创建合约和读取合约的方法
- ✅ 新增`use-wagmi-wallet` hook
- ✅ 删除旧的`use-metamask` hook
- ✅ 大幅重构`contract-utils.ts`文件

### 4. 撮合交易系统优化
- ✅ 完成撮合交易状态机重构
- ✅ 优化买单状态机配置
- ✅ 使用viem的`parseEther`和`zeroAddress`
- ✅ 清理冗余代码，提升性能

### 5. 代码质量提升
- ✅ 删除多个过时的工具函数文件
- ✅ 统一代码结构和命名规范
- ✅ 优化钱包账户管理
- ✅ 提升项目整体架构清晰度

## 📊 技术指标

- **文件变更**: 26个文件被修改
- **代码行数**: 新增3,794行，删除795行
- **净增长**: +2,999行
- **删除文件**: 8个过时文件
- **新增文件**: 5个核心文件

## 🔧 技术栈更新

- **钱包**: Metamask → Rainbowkit
- **以太坊工具**: ethers → viem
- **状态管理**: 优化Zustand状态机
- **合约交互**: 重构为wagmi标准方式

## 🚨 破坏性变更

- 删除了`use-metamask` hook
- 重构了合约交互API
- 更新了钱包连接方式
- 部分工具函数签名变更

## 📝 详细变更日志

### 新增文件
- `src/components/wallet-connect-button/index.tsx`
- `src/configs/wagmi-config.ts`
- `src/hooks/use-wagmi-wallet.ts`
- `src/providers/query-provider.tsx`
- `src/providers/wagmi-config-provider.tsx`
- `src/providers/wagmi-provder.tsx`

### 删除文件
- `src/hooks/use-metamask.ts`
- `src/lib/assert-abi.ts`
- `src/lib/get-block-info.ts`
- `src/lib/get-block-number.ts`
- `src/lib/get-nft-order-nonce.ts`
- `src/lib/send-approve.ts`

### 主要重构文件
- `src/components/eip712-signature/index.tsx`
- `src/configs/buy-order-state-machine-config.ts`
- `src/configs/order-state-machine-config.ts`
- `src/lib/contract-utils.ts`
- `src/stores/buy-order-state-machine.ts`
- `src/stores/order-state-machine.ts`

## 🎉 使用说明

1. **钱包连接**: 现在支持Rainbowkit钱包，自动发现浏览器扩展
2. **合约交互**: 使用新的wagmi标准方式进行合约调用
3. **状态管理**: 状态机配置已优化，性能更佳
4. **撮合交易**: 重构后的撮合交易系统更加稳定

## 🔮 后续计划

- 进一步优化状态机性能
- 添加更多钱包支持
- 完善错误处理机制
- 增加测试覆盖率

## 📞 技术支持

如有问题，请查看项目文档或提交Issue。

---

**发布日期**: 2025年9月1日  
**版本号**: v0.2.0-rainbowkit-migration  
**分支**: feature_rainbowkit → main  
**提交**: a187ece
