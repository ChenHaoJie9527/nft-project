import { Hero } from '@/components/hero';
import { NFTProduct } from '@/components/nft-product';
import { Container } from '@/components/ui/container';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Container className="space-y-2xl py-8 md:space-y-3xl">
        <Hero />
        <NFTProduct />
      </Container>
      {/* 其他内容区域 */}
      {/* <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Container className="py-8">
          <Hero />
        </Container>
      </div> */}
    </div>
  );
}
