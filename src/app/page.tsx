import { CancelOrder } from '@/components/cancel-order';
import EIP712Signature from '@/components/eip712-signature';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WalletInfo from '@/components/wallet-info';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex w-full flex-col gap-4">
          <WalletInfo />
          <Card>
            <CardHeader>
              <CardTitle>NFT挂单</CardTitle>
            </CardHeader>
            <CardContent>
              <EIP712Signature />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NFT取消挂单</CardTitle>
            </CardHeader>
            <CardContent>
              <CancelOrder />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NFT出价</CardTitle>
            </CardHeader>
            <CardContent>123</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
