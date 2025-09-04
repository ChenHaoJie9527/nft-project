'use client';

import { WritingText } from '../ui/writing-text';

export default function HeroSubtitle() {
  return (
    <WritingText
      className="text-subtitle text-white"
      lineDelay={1.3}
      lineIndex={3}
      spacing={10}
      text="Buy and sell NFTs from the worid's top artists"
      transition={{
        duration: 1,
      }}
    />
  );
}
