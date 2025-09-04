import NFTList from './nft-list';

export function NFTProduct() {
  return (
    <section className="flex w-full flex-col items-center py-8">
      <h2 className="mb-4 font-[500] text-responsive-xl tracking-responsive">
        NFT product exclusive
      </h2>
      <p className="mb-8 w-full text-center text-responsive-sm tracking-responsive">
        Check out a selection of popular products you're looking for that might
        catch your eye.
      </p>

      {/* NFT卡片展示区 */}
      <NFTList />
    </section>
  );
}
