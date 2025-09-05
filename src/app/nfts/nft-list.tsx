import { Eye, Heart, Package } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

// 模拟异步数据获取
async function getUserNFTs() {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      id: '1',
      name: 'CloneX #3817',
      collection: 'CloneX',
      image:
        'https://placehold.co/300x300/87CEEB/FFFFFF/png?text=CloneX+%233817',
      price: '0.2 BTC',
      status: 'owned' as const,
    },
    {
      id: '2',
      name: 'CloneX #3818',
      collection: 'CloneX',
      image:
        'https://placehold.co/300x300/DDA0DD/FFFFFF/png?text=CloneX+%233818',
      price: '0.15 BTC',
      status: 'listed' as const,
    },
    {
      id: '3',
      name: 'BAYC #1234',
      collection: 'Bored Ape',
      image: 'https://placehold.co/300x300/F0E68C/FFFFFF/png?text=BAYC+%231234',
      status: 'sold' as const,
    },
  ];
}

function NFTItem({ nft }: { nft: Awaited<ReturnType<typeof getUserNFTs>>[0] }) {
  const getStatusBadge = () => {
    switch (nft.status) {
      case 'owned':
        return <Badge variant="secondary">持有中</Badge>;
      case 'listed':
        return <Badge variant="default">已挂单</Badge>;
      case 'sold':
        return (
          <Badge className="bg-destructive" variant="outline">
            已售出
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl shadow-lg">
      <div className="relative aspect-square">
        <Image
          alt={nft.name}
          className="h-full w-full object-cover"
          height={300}
          src={nft.image}
          width={300}
        />
        <div className="absolute top-3 left-3">{getStatusBadge()}</div>
      </div>

      <CardContent className="p-4">
        <p className="mb-1 text-gray-500 text-sm">{nft.collection}</p>
        <h3 className="mb-3 font-bold text-lg">{nft.name}</h3>
        {nft.price && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">价格</span>
            <span className="font-semibold">{nft.price}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {nft.status === 'owned' && (
          <Button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            管理
          </Button>
        )}
        {nft.status === 'listed' && (
          <Button className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            编辑
          </Button>
        )}
        {nft.status === 'sold' && (
          <div className="w-full text-center text-gray-500 text-sm">已售出</div>
        )}
      </CardFooter>
    </Card>
  );
}

export default async function Nfts() {
  const userNFTs = await getUserNFTs();
  const ownedCount = userNFTs.filter((nft) => nft.status === 'owned').length;
  const listedCount = userNFTs.filter((nft) => nft.status === 'listed').length;
  const soldCount = userNFTs.filter((nft) => nft.status === 'sold').length;

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">我的NFT收藏</h1>
        <p className="text-gray-600">管理和查看您的数字艺术收藏</p>

        {/* 简单统计 */}
        <div className="mt-6 flex gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-gray-600 text-sm">持有: {ownedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            <span className="text-gray-600 text-sm">挂单: {listedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            <span className="text-gray-600 text-sm">售出: {soldCount}</span>
          </div>
        </div>
      </div>
      {/* NFT网格 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {userNFTs.map((nft) => (
          <NFTItem key={nft.id} nft={nft} />
        ))}
      </div>
      {/* 空状态 */}
      {userNFTs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 font-semibold text-lg">暂无NFT收藏</h3>
          <p className="text-gray-600">开始收集您的第一个数字艺术品吧！</p>
        </div>
      )}
    </div>
  );
}
