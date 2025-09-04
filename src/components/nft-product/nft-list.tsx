import Image from 'next/image';
import { FlipButton } from '@/components/flip-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

// NFT数据接口
interface NFTItem {
  id: string;
  title: string;
  identifier: string;
  currentBid: string;
  bidderAvatar: string;
  image: string;
}

// 模拟NFT数据
const nftData: NFTItem[] = [
  {
    id: '1',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3817',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/87CEEB/FFFFFF/png?text=CloneX+%233817',
  },
  {
    id: '2',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3818',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/DDA0DD/FFFFFF/png?text=CloneX+%233818',
  },
  {
    id: '3',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3819',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/98FB98/FFFFFF/png?text=CloneX+%233819',
  },
  {
    id: '4',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3820',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/F0E68C/FFFFFF/png?text=CloneX+%233820',
  },
  {
    id: '5',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3821',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/FFB6C1/FFFFFF/png?text=CloneX+%233821',
  },
  {
    id: '6',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3822',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/DDA0DD/FFFFFF/png?text=CloneX+%233822',
  },
  {
    id: '7',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3823',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/87CEEB/FFFFFF/png?text=CloneX+%233823',
  },
  {
    id: '8',
    title: 'RTFKTCLONEXTM',
    identifier: 'CloneX #3824',
    currentBid: '0.2 BTC',
    bidderAvatar: '🐵',
    image: 'https://placehold.co/300x300/98FB98/FFFFFF/png?text=CloneX+%233824',
  },
];

function NFTItem({ nft }: { nft: NFTItem }) {
  return (
    <Card
      className="space-y-4 overflow-hidden rounded-xl p-[20px] shadow-xl transition-shadow duration-300 hover:shadow-2xl"
      key={nft.id}
    >
      {/* NFT图片区域 */}
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          alt={nft.identifier}
          className="h-full w-full object-cover"
          height={300}
          src={nft.image}
          width={300}
        />
      </div>

      <CardContent className="bg-white p-2">
        {/* 第一行：标题 */}
        <p className="mb-2 font-[800] text-[#CACACA] text-sm">{nft.title}</p>

        {/* 第二行：标识符和出价者头像 */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-black text-lg">{nft.identifier}</h3>
          {/* 出价者头像 */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg">
            {nft.bidderAvatar}
          </div>
        </div>

        {/* 第三行：当前出价 */}
        <div className="flex items-center justify-between">
          <p className="text-black text-sm">Current bid</p>
          <div className="flex items-center gap-1">
            {/* Bitcoin图标 */}
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500">
              <span className="font-bold text-white text-xs">₿</span>
            </div>
            <span className="font-semibold text-black">{nft.currentBid}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pb-0">
        <FlipButton
          backText="挂单"
          className="w-full"
          frontText={`${nft.currentBid}`}
        />
      </CardFooter>
    </Card>
  );
}

function NFTList() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {nftData.map((nft) => (
        <NFTItem key={nft.id} nft={nft} />
      ))}
    </div>
  );
}

export default NFTList;
