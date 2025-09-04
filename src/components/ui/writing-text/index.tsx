'use client';

import {
  motion,
  type Transition,
  type UseInViewOptions,
  useInView,
} from 'motion/react';
import { useImperativeHandle, useMemo, useRef } from 'react';

type WritingTextProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  transition?: Transition;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  inViewOnce?: boolean;
  spacing?: number | string;
  text: string;
  lineDelay?: number; // 新增：行延迟
  lineIndex?: number; // 新增：行索引
};

function WritingText({
  ref,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  spacing = 5,
  text,
  lineDelay = 0, // 默认无延迟
  lineIndex = 0, // 默认第一行
  transition = { type: 'spring', bounce: 0, duration: 2, delay: 0.5 },
  ...props
}: WritingTextProps) {
  const localRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  const words = useMemo(() => text.split(' '), [text]);

  // 计算每行的总延迟时间
  const totalLineDelay = lineIndex * lineDelay;

  return (
    <span data-slot="writing-text" ref={localRef} {...props}>
      {words.map((word, index) => (
        <motion.span
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          className="inline-block will-change-opacity will-change-transform"
          initial={{ opacity: 0, y: 10 }}
          key={index + word}
          style={{ marginRight: spacing }}
          transition={{
            ...transition,
            delay: totalLineDelay + index * (transition?.delay ?? 0),
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </span>
  );
}

export { WritingText, type WritingTextProps };
