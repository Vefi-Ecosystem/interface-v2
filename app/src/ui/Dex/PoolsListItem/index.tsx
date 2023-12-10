import React, { useState } from 'react';
import millify from 'millify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import RemoveLiquidityModal from '../RemoveLiquidityModal';
import { useRouter } from 'next/router';
import { useTokenBalance } from '../../../hooks/wallet';
import { useListingAsDictionary } from '../../../hooks/api';

export default function UserLPItem({ pair }: any) {
  const tokensListingAsDictionary = useListingAsDictionary();
  const { push } = useRouter();
  const [showRemoveLiquidityModal, setShowRemoveLiquidityModal] = useState(false);
  const { balance } = useTokenBalance(pair.pair.id);
  return (
    <div tabIndex={0} className="w-full collapse collapse-arrow bg-[#fff]/[.11] rounded-[15px]">
      <input type="checkbox" className="peer" />
      <div className="collapse-title flex flex-col justify-center items-start font-Syne">
        <div className="flex justify-start items-center gap-3">
          <div className="flex justify-center items-center gap-1">
            <div className="avatar">
              <div className="w-7 rounded-full">
                <img src={tokensListingAsDictionary[pair.pair.token0.id]?.logoURI ?? '/images/placeholder_image.svg'} alt={pair.pair.token0.symbol} />
              </div>
            </div>
            <div className="avatar">
              <div className="w-7 rounded-full">
                <img src={tokensListingAsDictionary[pair.pair.token1.id]?.logoURI ?? '/images/placeholder_image.svg'} alt={pair.pair.token1.symbol} />
              </div>
            </div>
          </div>
          <span className="font-[700] uppercase text-[0.85em] text-[#fff]">
            {pair.pair.token0.symbol}/{pair.pair.token1.symbol}
          </span>
        </div>
        <span className="text-[#a2b6ec] text-[0.85em] font-[700]">{millify(balance, { precision: 4 })}</span>
      </div>
      <div className="collapse-content px-3">
        <div className="flex flex-col justify-between items-center gap-3 w-full">
          <div className="border-y border-[#5d5d5d] py-5 flex flex-col justify-center items-center gap-2 w-full">
            <div className="flex justify-between items-center gap-2 w-full">
              <div className="flex justify-center items-center gap-1">
                <div className="avatar">
                  <div className="w-5 rounded-full">
                    <img
                      src={tokensListingAsDictionary[pair.pair.token0.id]?.logoURI ?? '/images/placeholder_image.svg'}
                      alt={pair.pair.token0.symbol}
                    />
                  </div>
                </div>
                <span className="font-[500] capitalize text-[0.85em] text-[#fff]">Pooled {pair.pair.token0.symbol}</span>
              </div>
              <span className="text-[#a2b6ec] text-[0.85em] font-Poppins font-[700]">
                {millify(parseFloat(pair.pair.reserve0), { precision: 4 })}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 w-full">
              <div className="flex justify-center items-center gap-1">
                <div className="avatar">
                  <div className="w-5 rounded-full">
                    <img
                      src={tokensListingAsDictionary[pair.pair.token1.id]?.logoURI ?? '/images/placeholder_image.svg'}
                      alt={pair.pair.token1.symbol}
                    />
                  </div>
                </div>
                <span className="font-[500] capitalize text-[0.85em] text-[#fff]">Pooled {pair.pair.token1.symbol}</span>
              </div>
              <span className="text-[#a2b6ec] text-[0.85em] font-Poppins font-[700]">
                {millify(parseFloat(pair.pair.reserve1), { precision: 4 })}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full gap-5">
            <button
              onClick={() => setShowRemoveLiquidityModal(true)}
              className="flex justify-center items-center bg-[#e32345] py-4 px-2 rounded-[8px] gap-2 text-[0.89em] text-white w-full"
            >
              <FiTrash2 /> <span className="font-Syne capitalize">remove liquidity</span>
            </button>
            <button
              onClick={() => push(`/dex?tab=liquidity&child_tab=add_liquidity&inputToken=${pair.pair.token0.id}&outputToken=${pair.pair.token1.id}`)}
              className="border-[#a6b2ec] border rounded-[8px] w-full py-[13px] px-[17px] text-[#a6b2ec] text-[0.89em] font-[600] flex justify-center items-center gap-2"
            >
              <FiPlus /> <span className="font-Syne capitalize">add liquidity</span>
            </button>
          </div>
        </div>
      </div>
      <RemoveLiquidityModal isVisible={showRemoveLiquidityModal} onClose={() => setShowRemoveLiquidityModal(false)} pair={pair.pair.id} />
    </div>
  );
}
