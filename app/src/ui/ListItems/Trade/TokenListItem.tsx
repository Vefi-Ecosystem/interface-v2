import { AddressZero } from "@ethersproject/constants";

interface TokenListItemProps {
  imgURI: string;
  tokenAddress: string;
}

export default function SwapListItem({ imgURI, tokenAddress }: TokenListItemProps) {
  const tokenDetails = useTokenDetails(tokenAddress);
  const ethBalance = useETHBalance();
  const balance = useERC20Balance(tokenAddress);
  return (
    <div className="w-full flex justify-between items-center px-2 py-2 h-full">
      <div className="flex justify-start items-center gap-2">
        <div className="avatar">
          <div className="w-6 md:w-8 rounded-full">
            <img src={imgURI} alt={tokenDetails?.symbol} />
          </div>
        </div>
        <div className="flex flex-col justify-start items-start self-stretch gap-1">
          <h3 className="text-sm md:text-lg font-inter font-[500] uppercase text-[#fff]">
            {tokenAddress === AddressZero ? "eth" : tokenDetails?.symbol}
          </h3>
          <span className="text-[#6e7276] font-inter text-xs md:text-sm capitalize font-[400]">
            {tokenAddress === AddressZero ? "ethereum" : tokenDetails?.name}
          </span>
        </div>
      </div>
      <span className="text-[#fff] font-inter font-[500] text-xs">
        {tokenAddress === AddressZero
          ? ethBalance.toLocaleString("en-US", { maximumFractionDigits: 3 })
          : balance.toLocaleString("en-US", { maximumFractionDigits: 3 })}
      </span>
    </div>
  );
}