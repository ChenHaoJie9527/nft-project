import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';

type HeroProps = Partial<{
  subtitle: string;
  buttonText: string;
  backgroundImage: string;
}>;

export function Hero({
  subtitle = "Buy and sell NFTs from the worid's top artists",
  buttonText = 'VIEW COLLECTION',
  backgroundImage = '/hero/hero-bg.webp',
}: HeroProps) {
  return (
    <section className="relative aspect-[1654/855] w-full overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="Hero background"
          className="object-cover"
          fill
          priority
          quality={100}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 100vw"
          src={backgroundImage}
        />
      </div>
      {/* 标题 */}
      <div className="-top-[30%] absolute inset-0 left-[5vw] z-10 flex items-center">
        <div className="pr-8 pl-12">
          <h1 className="space-y-4 text-hero text-white">
            <div>Discover,</div>
            <div>collect, and sell</div>
            <div>
              extraordinary <span className="text-blue-400">NFTs</span>
            </div>
          </h1>
        </div>
      </div>

      {/* 副标题 */}
      <div className="absolute inset-0 top-[25%] left-[5vw] z-10 flex items-center">
        <div className="pr-8 pl-12">
          <p className="text-subtitle text-white">{subtitle}</p>
        </div>
      </div>

      {/* 按钮 */}
      <div className="absolute inset-0 top-[70%] left-[5vw] z-50 flex items-center">
        <div className="pr-8 pl-12">
          <Button
            className="h-8 px-2 text-sm md:h-10 md:cursor-pointer md:px-6"
            variant="default"
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
