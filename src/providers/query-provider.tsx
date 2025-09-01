'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * @description 查询客户端提供者
 * @param {ReactNode} children
 * @returns {ReactNode}
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /**
             * staleTime： 数据在1分钟内被认为是新鲜的
             * 在这个时间内，不会重新发起网络请求
             * 直接从缓存中获取数据
             *
             * gcTime： 数据在内存中保留10分钟
             * 即使组件卸载，数据也不会立即清楚
             *
             * refetchOnWindowFocus： 当窗口重新聚焦时，重新发起网络请求
             */
            staleTime: 60 * 1000, // 1分钟
            gcTime: 10 * 60 * 1000, // 10分钟
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

QueryProvider.displayName = 'QueryProvider';
