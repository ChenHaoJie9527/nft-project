# 现代前端技术栈演示项目

这是一个集成了现代前端开发最佳实践和工具的演示项目。

## 🚀 技术栈

- **[Next.js](https://nextjs.org/) v15.5.2** - React 全栈框架
- **[React](https://reactjs.org/) v19** - 用户界面库
- **[TypeScript](https://www.typescriptlang.org/) v5.9.2** - 类型安全的 JavaScript
- **[Tailwind CSS](https://tailwindcss.com/) v4** - 实用优先的 CSS 框架
- **[shadcn/ui](https://ui.shadcn.com/)** - 可复用的 React 组件
- **[SWR](https://swr.vercel.app/) v2.3.6** - 数据获取库
- **[Zustand](https://zustand-demo.pmnd.rs/) v5.0.8** - 轻量级状态管理

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # 全局样式和 Tailwind 配置
│   └── page.tsx        # 主页面
├── components/         # React 组件
│   ├── ui/            # shadcn/ui 基础组件
│   ├── CounterDemo.tsx # Zustand 状态管理演示
│   └── UsersDemo.tsx   # SWR 数据获取演示
├── hooks/              # 自定义 React Hooks
│   └── useUsers.ts     # SWR 用户数据 Hook
├── lib/                # 工具函数
│   └── utils.ts        # 通用工具函数
├── stores/             # Zustand 状态存储
│   └── counterStore.ts # 计数器状态
└── types/              # TypeScript 类型定义
    └── index.ts        # 通用类型
```

## 🎯 功能特点

### ✅ 完整的技术栈集成
- Next.js 15.5.2 配置了最新的 App Router
- React 19 的最新特性支持
- TypeScript 5.9.2 提供完整的类型安全
- Tailwind CSS v4 的新配置方式
- shadcn/ui 提供美观的组件库

### 🔄 状态管理演示
- **Zustand**: 轻量级状态管理，展示计数器功能
- **SWR**: 数据获取和缓存，展示用户列表

### 🎨 现代化 UI
- 响应式设计，支持暗黑模式
- 优雅的组件设计和动画
- 一致的设计语言

### 📱 开发体验
- 热重载和快速刷新
- TypeScript 智能提示
- ESLint 代码检查
- 规范的项目结构

## 🛠️ 开始使用

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建生产版本

```bash
# 使用 pnpm
pnpm build

# 或使用 npm
npm run build
```

### 启动生产服务器

```bash
# 使用 pnpm
pnpm start

# 或使用 npm
npm start
```

## 📚 主要组件说明

### CounterDemo 组件
展示 Zustand 状态管理的使用：
- 全局状态存储
- 状态更新方法
- 组件间状态共享

### UsersDemo 组件
展示 SWR 数据获取的使用：
- 异步数据获取
- 加载状态处理
- 错误状态处理
- 自动重试和缓存

### shadcn/ui 组件
- **Button**: 可配置的按钮组件
- **Card**: 卡片容器组件
- **Badge**: 徽章组件

## 🎨 样式系统

项目使用 Tailwind CSS v4 的新配置方式：
- CSS 变量定义主题
- 支持暗黑模式
- 响应式设计类
- 自定义设计令牌

## 🔧 开发工具

- **ESLint**: 代码质量检查
- **TypeScript**: 类型检查
- **Tailwind CSS**: 样式开发
- **Next.js**: 开发服务器和构建工具

## 📖 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [SWR 文档](https://swr.vercel.app/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

MIT License