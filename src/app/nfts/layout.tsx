import type { Metadata } from 'next';

import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: '我的NFT收藏 - NFT Gallery',
  description: '管理和查看您的数字艺术收藏、包括持有、挂单、和已出售的NFT',
};

type NFTsLayoutProps = {
  children: React.ReactNode;
};

export default function NFTsLayout({ children }: NFTsLayoutProps) {
  return (
    <div className="min-h-screen py-8">
      <Container>{children}</Container>
    </div>
  );
}
