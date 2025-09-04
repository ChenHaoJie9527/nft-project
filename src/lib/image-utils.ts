/**
 * 图片优化工具函数
 * 用于生成不同尺寸和格式的图片URL，优化加载性能
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: boolean;
}

/**
 * 生成响应式图片URL
 * 根据设备类型和屏幕尺寸返回合适的图片URL
 */
export function getResponsiveImageUrl(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width = 1920,
    height = 1080,
    quality = 85,
    format = 'webp',
    blur = false,
  } = options;

  // 如果是外部URL，直接返回
  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }

  // 构建优化后的URL
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    q: quality.toString(),
    f: format,
    ...(blur && { blur: '1' }),
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * 获取不同断点的图片尺寸
 */
export function getResponsiveImageSizes(): string {
  return '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw';
}

/**
 * 生成图片的srcSet
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [640, 768, 1024, 1280, 1920]
): string {
  return sizes
    .map((size) => {
      const url = getResponsiveImageUrl(baseUrl, { width: size });
      return `${url} ${size}w`;
    })
    .join(', ');
}

/**
 * 预加载关键图片
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 检查浏览器是否支持WebP格式
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 获取最佳图片格式
 */
export function getBestImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') {
    return 'jpeg';
  }

  // 检查AVIF支持
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }

  // 检查WebP支持
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  return 'jpeg';
}
