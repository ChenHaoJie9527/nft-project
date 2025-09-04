import { Hero } from '@/components/hero';
import { Container } from '@/components/ui/container';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Container className="py-8">
        <Hero />
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
