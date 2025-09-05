import { Hero } from '@/components/hero';
import { NFTProduct } from '@/components/nft-product';

export default function Home() {
  return (
    <div className="space-y-2xl md:space-y-3xl">
      <Hero />
      <NFTProduct />
    </div>
  );
}
