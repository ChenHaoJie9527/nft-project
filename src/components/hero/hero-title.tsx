'use client';

import { WritingText } from '../ui/writing-text';

export default function HeroTitle() {
  return (
    <h1 className="flex flex-col space-y-2 text-hero text-white md:space-y-4">
      <WritingText lineDelay={0.8} lineIndex={0} text="Discover," />
      <WritingText
        lineDelay={0.8}
        lineIndex={1}
        spacing={10}
        text="collect, and sell"
      />
      <div>
        <WritingText
          lineDelay={1.2}
          lineIndex={2}
          spacing={10}
          text="extraordinary"
        />
        <WritingText
          className="text-blue-400"
          lineDelay={1}
          lineIndex={3}
          spacing={10}
          text="NFTs"
        />
      </div>
    </h1>
  );
}
