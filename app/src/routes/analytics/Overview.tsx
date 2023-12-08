/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, MouseEvent, useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { TailSpin } from 'react-loader-spinner';
import { FiArrowDown, FiArrowUp, FiSearch } from 'react-icons/fi';
import { filter, map, multiply, toLower, trim } from 'lodash';
import millify from 'millify';
import { formatEthAddress } from 'eth-address';
import Moment from 'react-moment';
import {
  useAllBurns,
  useAllMints,
  useAllSwaps,
  useAllTransactions,
  useHighestTransactionToken,
  useHighestVolumeToken,
  useMostPopularToken,
  useOverviewChartData,
  useQuasarFactoriesStats,
  useTopPair,
  useTopPairs,
  useTopTokens
} from '../../hooks/analytics';
import SquareToggleButton from '../../ui/Button/SquareToggleButton';
import { TBody, TCell, THead, TRow, Table } from '../../ui/Table';
import Pagination from '../../ui/Pagination';
import chains from '../../assets/chains.json';
import { useWeb3Context } from '../../contexts/web3';
import AreaChart from '../../ui/Chart/AreaChart';
import { useExplorerLink } from '../../hooks/global';
import Empty from '../../ui/Empty';
import { useListingAsDictionary } from '../../hooks/api';

enum Tabs {
  OVERVIEW = 'overview',
  PAIRS = 'pairs',
  TOKENS = 'tokens',
  TXNS = 'transactions'
}

enum ChartView {
  TX = 'transactions',
  VOL = 'volume',
  LIQ = 'liquidity'
}

enum ChartPeriod {
  H24 = 86400,
  D3 = 259200,
  D7 = 604800,
  M1 = 2419200,
  Y1 = 29030400
}

enum TransactionView {
  ALL = 'all',
  SWAPS = 'swaps',
  ADDS = 'adds',
  REMOVES = 'removes'
}

const FilterBtn = ({ isActive, onClick, children }: { isActive: boolean; onClick: (event?: MouseEvent) => any; children: any }) => (
  <button
    className={`${
      isActive ? 'bg-[#373b4f] rounded-[6px] text-[#a6b2ec]' : 'bg-transparent text-[#cdcccc]'
    } py-2 px-2 flex justify-center text-[0.3em] lg:text-[0.65em] font-Poppins font-[400]`}
    onClick={onClick}
  >
    {children}
  </button>
);

const OverviewChart = ({ period }: { period: ChartPeriod }) => {
  const { query, push, asPath } = useRouter();
  const chartView = useMemo(() => (query.chartView as ChartView) || ChartView.TX, [query.chartView]);
  const { isLoading, data } = useOverviewChartData(period);
  const { data: statData } = useQuasarFactoriesStats();
  const [hoverDate, setHoverDate] = useState<string | undefined>(undefined);
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
  const areaDataKey = useMemo(() => {
    if (chartView === ChartView.TX) return 'txCount';
    else if (chartView === ChartView.VOL) return 'totalVolumeUSD';
    else return 'totalLiquidityUSD';
  }, [chartView]);

  return (
    <div className="w-full px-4 py-4 border border-[#5d5d5d] rounded-[8px] min-h-[24rem]">
      <div className="flex flex-col gap-5 justify-center items-start w-full">
        <span className="text-[#a6b2ec] font-Syne text-[1.5em] capitalize font-[700]">vefi DEX info & analytics</span>
        <div className="flex justify-start items-center gap-0 w-auto bg-[#fff]/[.07] rounded-[6px] px-1 py-1">
          <FilterBtn
            isActive={chartView === ChartView.TX}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.OVERVIEW}&chartView=${ChartView.TX}`)}
          >
            <span>Transactions</span>
          </FilterBtn>
          <FilterBtn
            isActive={chartView === ChartView.VOL}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.OVERVIEW}&chartView=${ChartView.VOL}`)}
          >
            <span>Volume</span>
          </FilterBtn>
          <FilterBtn
            isActive={chartView === ChartView.LIQ}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.OVERVIEW}&chartView=${ChartView.LIQ}`)}
          >
            <span>Liquidity</span>
          </FilterBtn>
        </div>
        <TailSpin color="#dcdcdc" visible={isLoading} width={60} height={60} />
        <div className="flex flex-col gap-1 justify-center items-center">
          <span className="text-[#fff] font-Syne font-[500] text-[1.35em]">
            {chartView !== ChartView.TX && '$'}
            {hoverValue ??
              millify(
                chartView === ChartView.TX ? statData.txCount : chartView === ChartView.VOL ? statData.totalVolumeUSD : statData.totalLiquidityUSD
              )}
          </span>
          <span className="text-[#23e33e] font-Syne font-[400] text-[0.85em]">
            {hoverDate ??
              new Date().toLocaleDateString(undefined, {
                year: 'numeric',
                day: 'numeric',
                month: 'short'
              })}
          </span>
        </div>
        {data && data.length > 0 && (
          <div className="flex justify-center items-center w-full min-h-[26rem]">
            <ResponsiveContainer width={'100%'} height={416}>
              <AreaChart
                data={map(data, (item) => ({
                  date: new Date(multiply(item.date, 1000)),
                  txCount: parseInt(item.txCount),
                  totalVolumeUSD: parseFloat(item.totalVolumeUSD),
                  totalLiquidityUSD: parseFloat(item.totalLiquidityUSD)
                }))}
                width={350}
                height={350}
                xAxisDataKey="date"
                areaDataKey={areaDataKey}
                hideXAxis={false}
                hideYAxis={false}
                yAxisOrientation="left"
                fill="#4b0082"
                stroke="#4b0082"
                tooltiped
                setHoverDate={setHoverDate}
                setHoverValue={setHoverValue}
              />
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const TopPairsList = () => {
  const tokensListingAsDictionary = useListingAsDictionary();
  const { chainId } = useWeb3Context();
  const [page, setPage] = useState<number>(1);
  const { isLoading, data, error } = useTopPairs(page - 1);
  const { isLoading: isPairCountLoading, data: pairCountData } = useQuasarFactoriesStats();
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
  return (
    <div className="w-full px-3 py-2 flex flex-col gap-3 justify-center items-center overflow-auto hidden-scrollbar">
      <Table>
        <THead>
          <TRow>
            <TCell className="text-left py-2">
              <span className="capitalize">pair</span>
            </TCell>
            <TCell className="text-center py-2">
              <span className="capitalize">volume</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">reserve {chain.symbol}</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">token trade volume</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">token trade volume</span>
            </TCell>
            <TCell className="text-center py-2">
              <span className="capitalize">action</span>
            </TCell>
          </TRow>
        </THead>
        <TBody>
          <TailSpin color="#dcdcdc" visible={isLoading} width={20} height={20} />
          {error ? (
            <span className="font-Poppins text-red-500 text-[0.87em]">{error.message}</span>
          ) : (
            <>
              {data.length === 0 ? (
                <Empty />
              ) : (
                map(data, (item, index) => (
                  <TRow key={index}>
                    <TCell className="text-center py-4">
                      <div className="flex justify-start items-center gap-2 w-full">
                        <div className="flex justify-center items-center gap-1">
                          <div className="avatar">
                            <div className="w-6 rounded-full border border-[#353535]">
                              <img
                                src={tokensListingAsDictionary[item.token0.id]?.logoURI ?? '/images/placeholder_image.svg'}
                                alt={item.token0.symbol}
                              />
                            </div>
                          </div>
                          <div className="avatar">
                            <div className="w-6 rounded-full border border-[#353535]">
                              <img
                                src={tokensListingAsDictionary[item.token1.id]?.logoURI ?? '/images/placeholder_image.svg'}
                                alt={item.token1.symbol}
                              />
                            </div>
                          </div>
                        </div>
                        <Link href={`/analytics?view=singlePair&pair=${item.id}`}>
                          <a>
                            <span className="font-Syne text-[#fff] text-[700] text-[0.5em] lg:text-[0.85em] uppercase">
                              {item.token0.symbol}/{item.token1.symbol}
                            </span>
                          </a>
                        </Link>
                      </div>
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400]">
                      ${millify(parseFloat(item.volumeUSD))}
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      {millify(parseFloat(item.reserveETH))}
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      {millify(parseFloat(item.token0.tradeVolume))} {item.token0.symbol}
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      {millify(parseFloat(item.token1.tradeVolume))} {item.token1.symbol}
                    </TCell>
                    <TCell className="text-center">
                      <Link href={`/dex?tab=swap&inputToken=${item.token0.id}&outputToken=${item.token1.id}`}>
                        <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">trade</span>
                      </Link>
                    </TCell>
                  </TRow>
                ))
              )}
            </>
          )}
        </TBody>
      </Table>
      <Pagination currentPage={page} itemsPerPage={10} onPageChange={setPage} dataLength={isPairCountLoading ? 0 : pairCountData.pairCount} />
    </div>
  );
};

const TopTokensList = () => {
  const tokensListingAsDictionary = useListingAsDictionary();
  const { chainId } = useWeb3Context();
  const [page, setPage] = useState<number>(1);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const { isLoading, data, error } = useTopTokens(page - 1, order);
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);

  return (
    <div className="w-full px-3 py-2 flex flex-col gap-3 justify-center items-center overflow-auto hidden-scrollbar">
      <Table>
        <THead>
          <TRow>
            <TCell className="text-left py-2">
              <span className="capitalize">token</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">price</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">change</span>
            </TCell>
            <TCell className="text-center py-2">
              <div className="flex justify-center items-center gap-1">
                <span className="capitalize">volume (USD)</span>
                <button className="px-1 py-1 bg-transparent text-[#6093df]" onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
                  {order === 'desc' ? <FiArrowUp /> : <FiArrowDown />}
                </button>
              </div>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">derived {chain.symbol}</span>
            </TCell>
            <TCell className="text-center py-2 hidden lg:table-cell">
              <span className="capitalize">total supply</span>
            </TCell>
          </TRow>
        </THead>
        <TBody>
          <TailSpin color="#dcdcdc" visible={isLoading} width={20} height={20} />
          {error ? (
            <span className="font-Poppins text-red-500 text-[0.87em]">{error.message}</span>
          ) : (
            <>
              {data.length === 0 ? (
                <Empty />
              ) : (
                map(data, (item, index) => (
                  <TRow key={index}>
                    <TCell className="text-center py-4">
                      <div className="flex justify-start items-center gap-2 w-full">
                        <div className="flex justify-center items-center gap-1">
                          <div className="avatar">
                            <div className="w-6 rounded-full border border-[#353535]">
                              <img src={tokensListingAsDictionary[item.id]?.logoURI ?? '/images/placeholder_image.svg'} alt={item.symbol} />
                            </div>
                          </div>
                          <Link href={`/analytics?view=singleToken&token=${item.id.toLowerCase()}`}>
                            <a className="flex justify-center items-center gap-1 font-Syne">
                              <span className="text-[#fff] capitalize text-[0.5em] lg:text-[0.86em]">{item.name}</span>
                              <span className="text-[#fff]/50 uppercase text-[0.5em] lg:text-[0.86em]">{item.symbol}</span>
                            </a>
                          </Link>
                        </div>
                      </div>
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      ${millify(parseFloat(item.derivedUSD))}
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      <div className="flex justify-center items-center">
                        <AreaChart
                          data={map(item.tokenDayData, (item) => ({
                            date: new Date(multiply(item.date, 1000)),
                            dailyVolumeETH: parseFloat(item.dailyVolumeETH)
                          }))}
                          width={50}
                          height={50}
                          xAxisDataKey="date"
                          areaDataKey="dailyVolumeETH"
                          hideXAxis={true}
                          hideYAxis={true}
                          yAxisOrientation="right"
                          fill="transparent"
                          stroke="#23e33e"
                        />
                      </div>
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400]">
                      ${millify(parseFloat(item.tradeVolumeUSD))}
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      {millify(parseFloat(item.derivedETH))}
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      {millify(parseInt(item.totalSupply))} {item.symbol}
                    </TCell>
                  </TRow>
                ))
              )}
            </>
          )}
        </TBody>
      </Table>
      <Pagination currentPage={page} itemsPerPage={10} onPageChange={setPage} dataLength={20} />
    </div>
  );
};

const TransactionsList = () => {
  const { query, push, asPath } = useRouter();
  const transactionView = useMemo(() => (query.transactionView as TransactionView) || TransactionView.ALL, [query.transactionView]);
  const { data: statData } = useQuasarFactoriesStats();
  const [allTransactionsPage, setAllTransactionsPage] = useState<number>(1);
  const [allMintsPage, setAllMintsPage] = useState<number>(1);
  const [allSwapsPage, setAllSwapsPage] = useState<number>(1);
  const [allBurnsPage, setAllBurnsPage] = useState<number>(1);
  const [allTransactionsOrder, setAllTransactionsOrder] = useState<'asc' | 'desc'>('desc');
  const [allMintsOrder, setAllMintsOrder] = useState<'asc' | 'desc'>('desc');
  const [allSwapsOrder, setAllSwapsOrder] = useState<'asc' | 'desc'>('desc');
  const [allBurnsOrder, setAllBurnsOrder] = useState<'asc' | 'desc'>('desc');
  const {
    isLoading: allTransactionsLoading,
    data: allTransactionsData,
    error: allTransactionsError
  } = useAllTransactions(allTransactionsPage - 1, allTransactionsOrder);
  const { isLoading: allMintsLoading, data: allMintsData, error: allMintsError } = useAllMints(allMintsPage - 1, allMintsOrder);
  const { isLoading: allSwapsLoading, data: allSwapsData, error: allSwapsError } = useAllSwaps(allSwapsPage - 1, allSwapsOrder);
  const { isLoading: allBurnsLoading, data: allBurnsData, error: allBurnsError } = useAllBurns(allBurnsPage - 1, allBurnsOrder);
  const [searchValue, setSearchValue] = useState('');

  const AllTransactions = () => (
    <div className="flex flex-col justify-center w-full items-center gap-2">
      {allTransactionsError ? (
        <span className="font-Poppins text-red-500 text-[0.87em]">{allTransactionsError.message}</span>
      ) : (
        <Table>
          <THead>
            <TRow>
              <TCell className="text-center py-2">
                <span className="capitalize">action</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">value (USD)</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">account</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">transaction</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <div className="flex justify-center items-center gap-1">
                  <span className="capitalize">time</span>
                  <button
                    className="px-1 py-1 bg-transparent text-[#6093df]"
                    onClick={() => setAllTransactionsOrder(allTransactionsOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {allTransactionsOrder === 'desc' ? <FiArrowUp /> : <FiArrowDown />}
                  </button>
                </div>
              </TCell>
            </TRow>
          </THead>

          <TailSpin color="#dcdcdc" visible={allTransactionsLoading} width={20} height={20} />
          {allTransactionsData.length === 0 ? (
            <Empty />
          ) : (
            map(
              trim(searchValue).length > 0
                ? filter(allTransactionsData, (item) => toLower(item.id).startsWith(toLower(searchValue)))
                : allTransactionsData,
              (item, index) => (
                <TBody key={index}>
                  {map(item.mints, (mint, i) => (
                    <TRow key={i}>
                      <TCell className="text-center py-2">
                        <span className="bg-[#03c25b]/[.15] text-[#23e33e] font-Syne px-1 py-1 capitalize text-[0.75em] rounded-[30px]">add</span>
                      </TCell>
                      <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                        ${millify(parseFloat(mint.amountUSD))}
                      </TCell>
                      <TCell className="text-center py-2 font-[400]">
                        <div className="flex justify-center items-center flex-col gap-1">
                          <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(mint.amount0))}</span>
                          <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{mint.pair.token0.symbol}</span>
                        </div>
                      </TCell>
                      <TCell className="text-center py-2 font-[400]">
                        <div className="flex justify-center items-center flex-col gap-1">
                          <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(mint.amount1))}</span>
                          <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{mint.pair.token1.symbol}</span>
                        </div>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400] hidden lg:table-cell">
                        <a target="_blank" rel="noreferrer" href={useExplorerLink('address', mint.to)}>
                          <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                            {mint.to && formatEthAddress(mint.to, 6)}
                          </span>
                        </a>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.86em] font-[400]">
                        <a target="_blank" rel="noreferrer" href={useExplorerLink('tx', item.id)}>
                          <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                            view transaction
                          </span>
                        </a>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Syne text-[0.86em] font-[400] hidden lg:table-cell">
                        <Moment date={multiply(parseInt(item.timestamp), 1000)} fromNow ago />
                      </TCell>
                    </TRow>
                  ))}
                  {map(item.swaps, (swap, i) => (
                    <TRow key={i}>
                      <TCell className="text-center py-2">
                        <span className="bg-[#3878d7]/[.10] text-[#3878d7] font-Syne px-1 py-1 capitalize text-[0.75em] rounded-[30px]">swap</span>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                        ${millify(parseFloat(swap.amountUSD))}
                      </TCell>
                      <TCell className="text-center py-2 font-[400]">
                        <div className="flex justify-center items-center flex-col gap-1">
                          <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(swap.amount0In))}</span>
                          <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{swap.pair.token0.symbol}</span>
                        </div>
                      </TCell>
                      <TCell className="text-center py-2 font-[400]">
                        <div className="flex justify-center items-center flex-col gap-1">
                          <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(swap.amount1Out))}</span>
                          <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{swap.pair.token1.symbol}</span>
                        </div>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400] hidden lg:table-cell">
                        <a target="_blank" rel="noreferrer" href={useExplorerLink('address', swap.to)}>
                          <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                            {swap.to && formatEthAddress(swap.to, 6)}
                          </span>
                        </a>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.86em] font-[400]">
                        <a target="_blank" rel="noreferrer" href={useExplorerLink('tx', item.id)}>
                          <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                            view transaction
                          </span>
                        </a>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Syne text-[0.86em] font-[400] hidden lg:table-cell">
                        <Moment date={multiply(parseInt(item.timestamp), 1000)} fromNow ago />
                      </TCell>
                    </TRow>
                  ))}
                  {map(item.burns, (burn, i) => (
                    <TRow key={i}>
                      <TCell className="text-center py-2">
                        <span className="bg-[#f63859]/[.1] text-[#f63859] font-Syne px-1 py-1 capitalize text-[0.75em] rounded-[30px]">remove</span>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                        ${millify(parseFloat(burn.amountUSD))}
                      </TCell>
                      <TCell className="text-center py-2 font-[400]">
                        <div className="flex justify-center items-center flex-col gap-1">
                          <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(burn.amount0))}</span>
                          <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{burn.pair.token0.symbol}</span>
                        </div>
                      </TCell>
                      <TCell className="text-center py-2 font-[400]">
                        <div className="flex justify-center items-center flex-col gap-1">
                          <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(burn.amount1))}</span>
                          <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{burn.pair.token1.symbol}</span>
                        </div>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400] hidden lg:table-cell">
                        <a target="_blank" rel="noreferrer" href={useExplorerLink('address', burn.to)}>
                          <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                            {burn.to && formatEthAddress(burn.to, 6)}
                          </span>
                        </a>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.86em] font-[400]">
                        <a target="_blank" rel="noreferrer" href={useExplorerLink('tx', item.id)}>
                          <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                            view transaction
                          </span>
                        </a>
                      </TCell>
                      <TCell className="text-center py-2 text-[#fff] font-Syne text-[0.86em] font-[400] hidden lg:table-cell">
                        <Moment date={multiply(parseInt(item.timestamp), 1000)} fromNow ago />
                      </TCell>
                    </TRow>
                  ))}
                </TBody>
              )
            )
          )}
        </Table>
      )}

      <Pagination currentPage={allTransactionsPage} itemsPerPage={10} onPageChange={setAllTransactionsPage} dataLength={statData.txCount} />
    </div>
  );

  const Mints = () => (
    <div className="flex flex-col justify-center w-full items-center gap-2">
      {allMintsError ? (
        <span className="font-Poppins text-red-500 text-[0.87em]">{allMintsError.message}</span>
      ) : (
        <Table>
          <THead>
            <TRow>
              <TCell className="text-center py-2">
                <span className="capitalize">action</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">value (USD)</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">account</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">transaction</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <div className="flex justify-center items-center gap-1">
                  <span className="capitalize">time</span>
                  <button
                    className="px-1 py-1 bg-transparent text-[#6093df]"
                    onClick={() => setAllMintsOrder(allMintsOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {allMintsOrder === 'desc' ? <FiArrowUp /> : <FiArrowDown />}
                  </button>
                </div>
              </TCell>
            </TRow>
          </THead>

          <TailSpin color="#dcdcdc" visible={allMintsLoading} width={20} height={20} />
          <TBody>
            {allMintsData.length === 0 ? (
              <Empty />
            ) : (
              map(
                trim(searchValue).length > 0
                  ? filter(allMintsData, (item) => toLower(item.transaction.id).startsWith(toLower(searchValue)))
                  : allMintsData,
                (item, index) => (
                  <TRow key={index}>
                    <TCell className="text-center py-2">
                      <span className="bg-[#03c25b]/[.15] text-[#23e33e] font-Syne px-1 py-1 capitalize text-[0.75em] rounded-[30px]">add</span>
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      ${millify(parseFloat(item.amountUSD))}
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount0))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token0.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount1))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token1.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400] hidden lg:table-cell">
                      <a target="_blank" rel="noreferrer" href={useExplorerLink('address', item.to)}>
                        <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                          {item.to && formatEthAddress(item.to, 6)}
                        </span>
                      </a>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400]">
                      <a target="_blank" rel="noreferrer" href={useExplorerLink('tx', item.transaction.id)}>
                        <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                          view transaction
                        </span>
                      </a>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Syne text-[0.86em] font-[400] hidden lg:table-cell">
                      <Moment date={multiply(parseInt(item.timestamp), 1000)} fromNow ago />
                    </TCell>
                  </TRow>
                )
              )
            )}
          </TBody>
        </Table>
      )}
      <Pagination currentPage={allMintsPage} itemsPerPage={10} onPageChange={setAllMintsPage} dataLength={40} />
    </div>
  );

  const Burns = () => (
    <div className="flex flex-col justify-center w-full items-center gap-2">
      {allBurnsError ? (
        <span className="font-Poppins text-red-500 text-[0.87em]">{allBurnsError.message}</span>
      ) : (
        <Table>
          <THead>
            <TRow>
              <TCell className="text-center py-2">
                <span className="capitalize">action</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">value (USD)</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">account</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">transaction</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <div className="flex justify-center items-center gap-1">
                  <span className="capitalize">time</span>
                  <button
                    className="px-1 py-1 bg-transparent text-[#6093df]"
                    onClick={() => setAllBurnsOrder(allBurnsOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {allBurnsOrder === 'desc' ? <FiArrowUp /> : <FiArrowDown />}
                  </button>
                </div>
              </TCell>
            </TRow>
          </THead>

          <TailSpin color="#dcdcdc" visible={allBurnsLoading} width={20} height={20} />
          <TBody>
            {allBurnsData.length === 0 ? (
              <Empty />
            ) : (
              map(
                trim(searchValue).length > 0
                  ? filter(allBurnsData, (item) => toLower(item.transaction.id).startsWith(toLower(searchValue)))
                  : allBurnsData,
                (item, index) => (
                  <TRow key={index}>
                    <TCell className="text-center py-2">
                      <span className="bg-[#f63859]/[.1] text-[#f63859] font-Syne px-1 py-1 capitalize text-[0.75em] rounded-[30px]">remove</span>
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      ${millify(parseFloat(item.amountUSD))}
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount0))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token0.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount1))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token1.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400] hidden lg:table-cell">
                      <a target="_blank" rel="noreferrer" href={useExplorerLink('address', item.to)}>
                        <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                          {item.to && formatEthAddress(item.to, 6)}
                        </span>
                      </a>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400]">
                      <a target="_blank" rel="noreferrer" href={useExplorerLink('tx', item.transaction.id)}>
                        <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                          view transaction
                        </span>
                      </a>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Syne text-[0.86em] font-[400] hidden lg:table-cell">
                      <Moment date={multiply(parseInt(item.timestamp), 1000)} fromNow ago />
                    </TCell>
                  </TRow>
                )
              )
            )}
          </TBody>
        </Table>
      )}
      <Pagination currentPage={allBurnsPage} itemsPerPage={10} onPageChange={setAllBurnsPage} dataLength={40} />
    </div>
  );

  const Swaps = () => (
    <div className="flex flex-col justify-center w-full items-center gap-2">
      {allSwapsError ? (
        <span className="font-Poppins text-red-500 text-[0.87em]">{allSwapsError.message}</span>
      ) : (
        <Table>
          <THead>
            <TRow>
              <TCell className="text-center py-2">
                <span className="capitalize">action</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">value (USD)</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount (in)</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount (out)</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount (in)</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">token amount (out)</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <span className="capitalize">account</span>
              </TCell>
              <TCell className="text-center py-2">
                <span className="capitalize">transaction</span>
              </TCell>
              <TCell className="text-center py-2 hidden lg:table-cell">
                <div className="flex justify-center items-center gap-1">
                  <span className="capitalize">time</span>
                  <button
                    className="px-1 py-1 bg-transparent text-[#6093df]"
                    onClick={() => setAllSwapsOrder(allSwapsOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {allSwapsOrder === 'desc' ? <FiArrowUp /> : <FiArrowDown />}
                  </button>
                </div>
              </TCell>
            </TRow>
          </THead>

          <TailSpin color="#dcdcdc" visible={allSwapsLoading} width={20} height={20} />
          <TBody>
            {allSwapsData.length === 0 ? (
              <Empty />
            ) : (
              map(
                trim(searchValue).length > 0
                  ? filter(allSwapsData, (item) => toLower(item.transaction.id).startsWith(toLower(searchValue)))
                  : allSwapsData,
                (item, index) => (
                  <TRow key={index}>
                    <TCell className="text-center py-2">
                      <span className="bg-[#3878d7]/[.10] text-[#3878d7] font-Syne px-1 py-1 capitalize text-[0.75em] rounded-[30px]">swap</span>
                    </TCell>
                    <TCell className="text-center py-4 text-[#fff] font-Poppins text-[0.86em] font-[400] hidden lg:table-cell">
                      ${millify(parseFloat(item.amountUSD))}
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount0In))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token0.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount0Out))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token0.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount1In))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token1.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 font-[400]">
                      <div className="flex justify-center items-center flex-col gap-1">
                        <span className="text-[#fff] font-Poppins text-[0.85em]">{millify(parseFloat(item.amount1Out))}</span>
                        <span className="text-[#aaaaaa] font-Syne text-[0.85em] uppercase">{item.pair.token1.symbol}</span>
                      </div>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400] hidden lg:table-cell">
                      <a target="_blank" rel="noreferrer" href={useExplorerLink('address', item.to)}>
                        <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                          {item.to && formatEthAddress(item.to, 6)}
                        </span>
                      </a>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Poppins text-[0.5em] lg:text-[0.85em] font-[400]">
                      <a target="_blank" rel="noreferrer" href={useExplorerLink('tx', item.transaction.id)}>
                        <span className="capitalize font-Syne font-[400] text-[0.5em] lg:text-[0.85em] text-[#6093df] cursor-pointer">
                          view transaction
                        </span>
                      </a>
                    </TCell>
                    <TCell className="text-center py-2 text-[#fff] font-Syne text-[0.86em] font-[400] hidden lg:table-cell">
                      <Moment date={multiply(parseInt(item.timestamp), 1000)} fromNow ago />
                    </TCell>
                  </TRow>
                )
              )
            )}
          </TBody>
        </Table>
      )}
      <Pagination currentPage={allSwapsPage} itemsPerPage={10} onPageChange={setAllSwapsPage} dataLength={70} />
    </div>
  );

  const RenderedChild = () => {
    switch (transactionView) {
      case TransactionView.ALL:
        return <AllTransactions />;
      case TransactionView.ADDS:
        return <Mints />;
      case TransactionView.REMOVES:
        return <Burns />;
      case TransactionView.SWAPS:
        return <Swaps />;
      default:
        return <AllTransactions />;
    }
  };

  return (
    <div className="w-full px-0 lg:px-3 py-2 flex flex-col gap-3 justify-center items-center overflow-auto hidden-scrollbar">
      <div className="w-full flex flex-col-reverse lg:flex-row justify-start lg:justify-between items-center px-2 py-2 gap-4">
        <div className="flex justify-start items-center gap-0 w-auto bg-[#fff]/[.07] border border-[#555555] rounded-[6px] px-0 py-0">
          <FilterBtn
            isActive={transactionView === TransactionView.ALL}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.TXNS}&transactionView=${TransactionView.ALL}`)}
          >
            <span>View All</span>
          </FilterBtn>
          <FilterBtn
            isActive={transactionView === TransactionView.SWAPS}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.TXNS}&transactionView=${TransactionView.SWAPS}`)}
          >
            <span>Swaps</span>
          </FilterBtn>
          <FilterBtn
            isActive={transactionView === TransactionView.ADDS}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.TXNS}&transactionView=${TransactionView.ADDS}`)}
          >
            <span>Adds</span>
          </FilterBtn>
          <FilterBtn
            isActive={transactionView === TransactionView.REMOVES}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.TXNS}&transactionView=${TransactionView.REMOVES}`)}
          >
            <span>Removes</span>
          </FilterBtn>
        </div>
        <div className="bg-[#fff]/[.13] rounded-[8px] py-1 flex justify-start items-center gap-1 border border-[#5d5d5d] px-2">
          <FiSearch className="text-[1em] text-[#fff]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-transparent outline-0 font-Syne flex-1 text-[#fff]"
            placeholder="Search transaction by ID"
          />
        </div>
      </div>
      <RenderedChild />
    </div>
  );
};

const useOverviewRoutes = (tab: Tabs, period: number = 0) => {
  // eslint-disable-next-line react/display-name
  const [component, setComponent] = useState(() => () => OverviewChart({ period }));

  useEffect(() => {
    switch (tab) {
      case Tabs.PAIRS:
        setComponent(() => TopPairsList);
        break;
      case Tabs.TOKENS:
        setComponent(() => TopTokensList);
        break;
      case Tabs.OVERVIEW:
        setComponent(() => () => OverviewChart({ period }));
        break;
      case Tabs.TXNS:
        setComponent(() => TransactionsList);
        break;
      default:
        // eslint-disable-next-line react/display-name
        setComponent(() => () => OverviewChart({ period }));
        break;
    }
  }, [tab, period]);
  return component;
};

export default function Overview() {
  const { query, push, asPath } = useRouter();
  const tab = useMemo(() => (query.tab as Tabs) || Tabs.OVERVIEW, [query.tab]);
  const tokensListingAsDictionary = useListingAsDictionary();
  const { isLoading: isHighestVolumeDataLoading, data: highestVolumeData, error: highestVolumeFetchError } = useHighestVolumeToken();
  const {
    isLoading: isHighestTransactionDataLoading,
    data: highestTransactionData,
    error: highestTransactionFetchError
  } = useHighestTransactionToken();
  const { isLoading: isTopPairDataLoading, data: topPairData, error: topPairFetchError } = useTopPair();
  const { isLoading: isMostPopularTokenDataLoading, data: mostPopularTokenData, error: mostPopularTokenFetchError } = useMostPopularToken();
  const [chartPeriod, setChartPeriod] = useState(ChartPeriod.H24);
  const RenderedComponent = useOverviewRoutes(tab, chartPeriod);
  return (
    <div className="flex flex-col justify-center items-center container mx-auto px-6 py-7 gap-12 overflow-auto hidden-scrollbar">
      <div className="flex justify-center items-center w-full px-1 overflow-auto">
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 p-4 overflow-auto hidden-scrollbar w-full">
          <div className="flex-col flex justify-center items-center gap-4 border border-[#5d5d5d] rounded-[10px] px-3 py-3 w-full lg:w-1/4">
            <span className="font-Syne font-[400] text-[#fff]/50 text-[0.87em] capitalize">highest trade volume (24h)</span>
            {highestVolumeFetchError || !highestVolumeData ? (
              <>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src="/images/placeholder_image.svg" alt="placeholder image" />
                  </div>
                </div>
                <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                  <span className="text-[#fff] capitalize">not available</span>
                  <span className="text-[#fff]/50 capitalize">null</span>
                </div>
              </>
            ) : (
              <>
                <TailSpin color="#dcdcdc" visible={isHighestVolumeDataLoading} width={20} height={20} />
                {highestVolumeData && (
                  <>
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={tokensListingAsDictionary[highestVolumeData.id]?.logoURI ?? '/images/placeholder_image.svg'}
                          alt={highestVolumeData.symbol}
                        />
                      </div>
                    </div>
                    <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                      <span className="text-[#fff] capitalize">{highestVolumeData.name}</span>
                      <span className="text-[#fff]/50 uppercase">{highestVolumeData.symbol}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex-col flex justify-center items-center gap-4 border border-[#5d5d5d] rounded-[10px] px-3 py-3 w-full lg:w-1/4">
            <span className="font-Syne font-[400] text-[#fff]/50 text-[0.87em] capitalize">most traded token (24h)</span>
            {highestTransactionFetchError || !highestTransactionData ? (
              <>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src="/images/placeholder_image.svg" alt="placeholder image" />
                  </div>
                </div>
                <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                  <span className="text-[#fff] capitalize">not available</span>
                  <span className="text-[#fff]/50 capitalize">null</span>
                </div>
              </>
            ) : (
              <>
                <TailSpin color="#dcdcdc" visible={isHighestTransactionDataLoading} width={20} height={20} />
                {highestTransactionData && (
                  <>
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={tokensListingAsDictionary[highestTransactionData.id]?.logoURI ?? '/images/placeholder_image.svg'}
                          alt={highestTransactionData.symbol}
                        />
                      </div>
                    </div>
                    <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                      <span className="text-[#fff] capitalize">{highestTransactionData.name}</span>
                      <span className="text-[#fff]/50 uppercase">{highestTransactionData.symbol}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex-col flex justify-center items-center gap-4 border border-[#5d5d5d] rounded-[10px] px-3 py-3 w-full lg:w-1/4">
            <span className="font-Syne font-[400] text-[#fff]/50 text-[0.87em] capitalize">top pair</span>
            {topPairFetchError || !topPairData ? (
              <>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src="/images/placeholder_image.svg" alt="placeholder image" />
                  </div>
                </div>
                <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                  <span className="text-[#fff] capitalize">not available</span>
                  <span className="text-[#fff]/50 capitalize">null</span>
                </div>
              </>
            ) : (
              <>
                <TailSpin color="#dcdcdc" visible={isTopPairDataLoading} width={20} height={20} />
                {topPairData && (
                  <>
                    <div className="flex justify-center items-center gap-1">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={tokensListingAsDictionary[topPairData.token0.id]?.logoURI ?? '/images/placeholder_image.svg'}
                            alt={topPairData.token0.symbol}
                          />
                        </div>
                      </div>
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={tokensListingAsDictionary[topPairData.token1.id]?.logoURI ?? '/images/placeholder_image.svg'}
                            alt={topPairData.token1.symbol}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                      <span className="text-[#fff]/50 uppercase">{topPairData.token0.symbol}</span>
                      <span className="text-[#fff]/50 uppercase">{topPairData.token1.symbol}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex-col flex justify-center items-center gap-4 border border-[#5d5d5d] rounded-[10px] px-3 py-3 w-full lg:w-1/4">
            <span className="font-Syne font-[400] text-[#fff]/50 text-[0.87em] capitalize">most popular token</span>
            {mostPopularTokenFetchError || !mostPopularTokenData ? (
              <>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src="/images/placeholder_image.svg" alt="placeholder image" />
                  </div>
                </div>
                <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                  <span className="text-[#fff] capitalize">not available</span>
                  <span className="text-[#fff]/50 capitalize">null</span>
                </div>
              </>
            ) : (
              <>
                <TailSpin color="#dcdcdc" visible={isMostPopularTokenDataLoading} width={20} height={20} />
                {mostPopularTokenData && (
                  <>
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={tokensListingAsDictionary[mostPopularTokenData.id]?.logoURI ?? '/images/placeholder_image.svg'}
                          alt={mostPopularTokenData.symbol}
                        />
                      </div>
                    </div>
                    <div className="font-Syne text-[0.95em] flex justify-center items-center gap-1 w-full">
                      <span className="text-[#fff] capitalize">{mostPopularTokenData.name}</span>
                      <span className="text-[#fff]/50 uppercase">{mostPopularTokenData.symbol}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-start border-b border-[#353535] w-full px-2 py-2 overflow-auto hidden-scrollbar">
        <div className="flex justify-start items-center gap-2 lg:gap-4 w-auto">
          <SquareToggleButton
            isActive={tab === Tabs.OVERVIEW}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.OVERVIEW}`)}
          >
            <span>Overview</span>
          </SquareToggleButton>
          <SquareToggleButton
            isActive={tab === Tabs.PAIRS}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.PAIRS}`)}
          >
            <span>Pairs</span>
          </SquareToggleButton>
          <SquareToggleButton
            isActive={tab === Tabs.TOKENS}
            onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.TOKENS}`)}
          >
            <span>Tokens</span>
          </SquareToggleButton>
          <SquareToggleButton isActive={tab === Tabs.TXNS} onClick={() => push(`${new URL(asPath, window.location.href).pathname}?tab=${Tabs.TXNS}`)}>
            <span>Transactions</span>
          </SquareToggleButton>
        </div>
        {tab === Tabs.OVERVIEW && (
          <div className="flex justify-start items-center gap-0 w-auto bg-[#fff]/[.07] border border-[#555555] rounded-[6px] px-0 py-0">
            <FilterBtn isActive={chartPeriod === ChartPeriod.H24} onClick={() => setChartPeriod(ChartPeriod.H24)}>
              <span>24H</span>
            </FilterBtn>
            <FilterBtn isActive={chartPeriod === ChartPeriod.D3} onClick={() => setChartPeriod(ChartPeriod.D3)}>
              <span>3D</span>
            </FilterBtn>
            <FilterBtn isActive={chartPeriod === ChartPeriod.D7} onClick={() => setChartPeriod(ChartPeriod.D7)}>
              <span>7D</span>
            </FilterBtn>
            <FilterBtn isActive={chartPeriod === ChartPeriod.M1} onClick={() => setChartPeriod(ChartPeriod.M1)}>
              <span>1M</span>
            </FilterBtn>
            <FilterBtn isActive={chartPeriod === ChartPeriod.Y1} onClick={() => setChartPeriod(ChartPeriod.Y1)}>
              <span>1Y</span>
            </FilterBtn>
          </div>
        )}
      </div>
      <RenderedComponent />
    </div>
  );
}
