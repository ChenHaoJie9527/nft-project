'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NFTsError({
  _error,
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangle className="mb-4 h-16 w-16 text-red-500" />
      <h2 className="mb-2 font-bold text-2xl">加载失败</h2>
      <p className="mb-4 text-gray-600">无法加载您的NFT收藏</p>
      <Button onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" />
        重新加载
      </Button>
    </div>
  );
}
