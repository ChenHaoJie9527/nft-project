import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/main-layout';
import { QueryProvider } from '@/providers/query-provider';
import { WagmiComponentProvider } from '@/providers/wagmi-provder';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  fallback: [
    'PingFang SC', // macOS 中文字体
    'Hiragino Sans GB', // macOS 备选中文字体
    'Microsoft YaHei', // Windows 中文字体
    'SimHei', // Windows 备选中文字体
    'Noto Sans SC', // Google 中文字体
    'Source Han Sans SC', // Adobe 中文字体
    'system-ui', // 系统默认字体
    'sans-serif', // 通用回退
  ],
});

export const metadata: Metadata = {
  title: 'NFT Gallery - 数字艺术收藏平台',
  description: '发现、收集和交易独特的数字艺术作品',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.className} ${geistSans.variable}`} lang="en">
      <body className={'antialiased'}>
        <QueryProvider>
          <WagmiComponentProvider>
            <MainLayout>{children}</MainLayout>
          </WagmiComponentProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
