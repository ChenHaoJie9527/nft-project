import { Suspense } from 'react';
import NFTsLoading from './loading';
import Nfts from './nft-list';

export default function NftsPage() {
  return (
    <Suspense fallback={<NFTsLoading />}>
      <Nfts />
    </Suspense>
  );
}
