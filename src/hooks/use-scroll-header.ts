'use client';

import { useState } from 'react';
import { useOnWindowScroll } from 'rooks';
import { useClient } from '@/hooks/use-client';

type UseScrollHeaderOptions = {
  threshold?: number; // 滚动阈值，默认100px
  hideOnScrollDown?: boolean; // 向下滚动时隐藏，默认true
  showOnScrollUp?: boolean; // 向上滚动时显示，默认true
};

export function useScrollHeader({
  threshold = 100,
  hideOnScrollDown = true,
  showOnScrollUp = true,
}: UseScrollHeaderOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isClient = useClient();

  useOnWindowScroll(() => {
    if (!isClient) {
      return;
    }

    const currentScrollY = window.scrollY;

    if (currentScrollY <= threshold) {
      // 在顶部时显示
      setIsVisible(true);
    } else if (
      hideOnScrollDown &&
      currentScrollY > lastScrollY &&
      currentScrollY > threshold
    ) {
      // 向下滚动且超过阈值时隐藏
      setIsVisible(false);
    } else if (showOnScrollUp && currentScrollY < lastScrollY) {
      // 向上滚动时显示
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  }, isClient); // 只在客户端时激活

  return {
    isVisible,
  };
}
