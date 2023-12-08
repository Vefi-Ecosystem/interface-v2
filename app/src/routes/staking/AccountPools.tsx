import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useAllAccountPools, useStakingPoolFactoriesStats } from '../../hooks/staking';
import { TBody, TCell, THead, TRow, Table } from '../../ui/Table';
import { filter, floor, map, multiply, startsWith, trim } from 'lodash';
import { TailSpin } from 'react-loader-spinner';
import CountDown from 'react-countdown';
import Empty from '../../ui/Empty';
import Pagination from '../../ui/Pagination';
import StakeTokenModal from '../../ui/Staking/StakeTokenModal';
import { useListingAsDictionary } from '../../hooks/api';

const countdownRender = ({ days, hours, minutes, seconds }: any) => (
  <span className="font-Poppins font-[400] text-[1em] capitalize text-[#fff]">
    {days}d:{hours}h:{minutes}m:{seconds}s
  </span>
);

const StatusLabel = ({ timestamp }: { timestamp: number }) => (
  <div
    className={`flex justify-center items-center rounded-[30px] px-1 py-1 ${
      multiply(timestamp, 1000) > Date.now() ? 'bg-[#02c35b]/[.15] text-[#23e33e]' : 'bg-[#f63859]/10 text-[#f73859]'
    }`}
  >
    <span className="font-Syne font-[400] text-[0.72em] capitalize">{multiply(timestamp, 1000) > Date.now() ? 'live' : 'sold out'}</span>
  </div>
);

const All = ({ searchValue = '' }: { searchValue?: string }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAllAccountPools(page - 1);
  const tokensListingAsDictionary = useListingAsDictionary();
  const stats = useStakingPoolFactoriesStats();
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [selectedStakingPool, setSelectedStakingPool] = useState<any>(null);

  return (
    <div className="w-full px-0 py-2 flex flex-col gap-3 justify-center items-center overflow-auto hidden-scrollbar">
      <Table>
        <THead>
          <TRow>
            <TCell className="text-left px-2 py-2">
              <span className="capitalize">stake token</span>
            </TCell>
            <TCell className="text-center py-2">
              <span className="capitalize">reward token</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">apy</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">ends in</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">created on</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">block</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">status</span>
            </TCell>
            <TCell className="text-center py-2">
              <span className="capitalize">action</span>
            </TCell>
          </TRow>
        </THead>
        <TBody>
          <TailSpin color="#dcdcdc" visible={isLoading} width={20} height={20} />
          {data.length == 0 ? (
            <Empty />
          ) : (
            map(
              trim(searchValue).length > 0
                ? filter(
                    data,
                    (item) =>
                      startsWith(item.id.toLowerCase(), searchValue.toLowerCase()) ||
                      startsWith(item.stakedToken.name.toLowerCase(), searchValue.toLowerCase()) ||
                      startsWith(item.rewardToken.name.toLowerCase(), searchValue.toLowerCase()) ||
                      startsWith(item.stakedToken.id.toLowerCase(), searchValue.toLowerCase()) ||
                      startsWith(item.rewardToken.id.toLowerCase(), searchValue.toLowerCase())
                  )
                : data,
              (item, index) => (
                <TRow key={index}>
                  <TCell className="text-left px-2 py-2">
                    <div className="font-Syne flex justify-start items-center gap-2">
                      <div className="avatar">
                        <div className="w-6 rounded-full border border-[#353535]">
                          <img
                            src={tokensListingAsDictionary[item.stakedToken.id]?.logoURI ?? '/images/placeholder_image.svg'}
                            alt={item.stakedToken.symbol}
                          />
                        </div>
                      </div>
                      <span className="text-[#fff] font-[700] capitalize text-[1em]">{item.stakedToken.name}</span>
                      <span className="text-[#aaaaaa] font-[400] uppercase text-[1em]">{item.stakedToken.symbol}</span>
                    </div>
                  </TCell>
                  <TCell className="text-center px-2 py-2">
                    <div className="font-Syne flex justify-center items-center gap-2">
                      <div className="avatar">
                        <div className="w-6 rounded-full border border-[#353535]">
                          <img
                            src={tokensListingAsDictionary[item.rewardToken.id]?.logoURI ?? '/images/placeholder_image.svg'}
                            alt={item.rewardToken.symbol}
                          />
                        </div>
                      </div>
                      <span className="text-[#fff] font-[700] capitalize text-[1em]">{item.rewardToken.name}</span>
                      <span className="text-[#aaaaaa] font-[400] uppercase text-[1em]">{item.rewardToken.symbol}</span>
                    </div>
                  </TCell>
                  <TCell className="text-center px-2 py-2 hidden lg:table-cell">
                    <span className="text-[#23e33e] font-[400] uppercase text-[1em] font-Poppins">{item.apy}%</span>
                  </TCell>
                  <TCell className="text-center px-2 py-2 hidden lg:table-cell">
                    <CountDown date={multiply(parseInt(item.endsIn), 1000)} renderer={countdownRender} />
                  </TCell>
                  <TCell className="text-center px-2 py-2 hidden lg:table-cell">
                    <span className="text-[#fff] font-[400] text-[1em] font-Poppins">
                      {new Date(multiply(parseInt(item.blockTimestamp), 1000)).toDateString()}
                    </span>
                  </TCell>
                  <TCell className="text-center px-2 py-2 hidden lg:table-cell">
                    <span className="text-[#fff] font-[400] text-[1em] font-Poppins">{item.blockNumber}</span>
                  </TCell>
                  <TCell className="text-center px-2 py-2 hidden lg:table-cell">
                    <StatusLabel timestamp={parseInt(item.endsIn)} />
                  </TCell>
                  <TCell className="text-center">
                    <button
                      className="btn btn-ghost btn-xs lg:btn-sm"
                      onClick={() => {
                        setSelectedStakingPool(item);
                        setShowStakeModal(true);
                      }}
                    >
                      <span className="capitalize font-Syne font-[400] text-[0.75em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                        {parseInt(item.endsIn) > floor(Date.now() / 1000) ? 'stake' : 'check'}
                      </span>
                    </button>
                  </TCell>
                </TRow>
              )
            )
          )}
        </TBody>{' '}
      </Table>
      {data.length > 0 && (
        <div className="w-full px-5 py-2">
          <Pagination currentPage={page} itemsPerPage={10} onPageChange={setPage} dataLength={stats?.poolsCount || 0} />
        </div>
      )}
      <StakeTokenModal isOpen={showStakeModal} onClose={() => setShowStakeModal(false)} selectedStakingPoolID={selectedStakingPool?.id} />
    </div>
  );
};

export default function AccountPools() {
  const [searchValue, setSearchValue] = useState('');
  return (
    <div className="w-full px-0 py-4 border border-[#858585] rounded-[20px] overflow-auto hidden-scrollbar">
      <div className="flex flex-col gap-5 justify-center items-start w-full">
        <div className="flex justify-center lg:justify-end items-center w-full gap-3 px-2 py-2">
          <div className="bg-[#fff]/[.13] rounded-[8px] py-1 flex justify-start items-center gap-1 border border-[#5d5d5d] px-2">
            <FiSearch className="text-[1em] text-[#fff]" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-transparent outline-0 font-Syne flex-1 text-[#fff]"
              placeholder="Search"
            />
          </div>
        </div>
        <All searchValue={searchValue} />
      </div>
    </div>
  );
}
