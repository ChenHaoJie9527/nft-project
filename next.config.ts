import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    // 允许的图片域名（如果使用外部图片）
    domains: [],
    // 图片格式支持
    formats: ['image/webp', 'image/avif'],
    // 设备尺寸断点
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // 图片尺寸断点
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 最小缓存时间（秒）
    minimumCacheTTL: 60,
    // 危险地允许SVG（如果需要）
    dangerouslyAllowSVG: false,
    // 内容安全策略
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 压缩配置
  compress: true,
  
  // 实验性功能
  experimental: {
    // 启用优化的包导入
    optimizePackageImports: ['lucide-react'],
  },
  
  // 性能优化
  poweredByHeader: false,
  
  // 重定向和重写规则（如果需要）
  async redirects() {
    return [];
  },
  
  async rewrites() {
    return [];
  },
};

export default nextConfig;
