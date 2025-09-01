import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/main-layout';
import { QueryProvider } from '@/providers/query-provider';
import { WagmiComponentProvider } from '@/providers/wagmi-provder';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NFT Gallery - 数字艺术收藏平台',
  description: '发现、收集和交易独特的数字艺术作品',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <WagmiComponentProvider>
            <MainLayout>{children}</MainLayout>
          </WagmiComponentProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
