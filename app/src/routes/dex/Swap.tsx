/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { AiOutlineSwap } from 'react-icons/ai';
import { FiSettings, FiChevronDown } from 'react-icons/fi';
import { IoMdRefreshCircle } from 'react-icons/io';
import { MdArrowDownward } from 'react-icons/md';
import { AddressZero } from '@ethersproject/constants';
import { parseEther, parseUnits } from '@ethersproject/units';
import { multiply, toLower, get, map } from 'lodash';
import assert from 'assert';
import { WETH, Fetcher, Trade, TokenAmount, Router, Percent, ETHER, CurrencyAmount } from 'quasar-sdk-sub-core';
import JSBI from 'jsbi';
import { abi as erc20Abi } from 'quasar-v1-core/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import { abi as routerAbi } from 'quasar-v1-periphery/artifacts/contracts/QuasarRouter02.sol/QuasarRouter02.json';
import SwapSettingsModal from '../../ui/Dex/SwapSettingsModal';
import TokensListModal from '../../ui/Dex/TokensListModal';
import { useWeb3Context } from '../../contexts/web3';
import { usePairFromFactory, quote } from '../../hooks/dex';
import routers from '../../assets/routers.json';
import { useDEXSettingsContext } from '../../contexts/dex/settings';
import TradeCard from '../../ui/Dex/Card';
import { useEtherBalance, useTokenBalance } from '../../hooks/wallet';
import { useContract } from '../../hooks/global';
import Toast from '../../ui/Toast';
import { useImportedTokensWithListing, useTokenDetailsFromListing, useTokenImageURI } from '../../hooks/api';

export default function Swap() {
  const { refresh } = useRouter();
  const searchParams = useSearchParams()
  const inputToken = searchParams.get('inputToken')
  const outputToken = searchParams.get('outputToken')
  const [val1, setVal1] = useState<number>(0.0);
  const [val2, setVal2] = useState<number>(0.0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);
  const [isFirstTokensListModalVisible, setIsFirstTokensListModalVisible] = useState<boolean>(false);
  const [isSecondTokensListModalVisible, setIsSecondTokensListModalVisible] = useState<boolean>(false);
  const [isSwapLoading, setIsSwapLoading] = useState<boolean>(false);
  const { data: tokensListing } = useImportedTokensWithListing();
  const { chainId, active, account } = useWeb3Context();
  const { txDeadlineInMins, slippageTolerance, gasPrice, playSounds } = useDEXSettingsContext();
  const [firstSelectedToken, setFirstSelectedToken] = useState('');
  const [secondSelectedToken, setSecondSelectedToken] = useState('');

  const firstSelectedTokenDetails = useTokenDetailsFromListing(firstSelectedToken);
  const secondSelectedTokenDetails = useTokenDetailsFromListing(secondSelectedToken);
  const pair = usePairFromFactory(firstSelectedToken, secondSelectedToken);
  const { balance: balance1 } =
    firstSelectedToken === AddressZero ? useEtherBalance([isSwapLoading]) : useTokenBalance(firstSelectedToken, [isSwapLoading]);
  const { balance: balance2 } =
    secondSelectedToken === AddressZero ? useEtherBalance([isSwapLoading]) : useTokenBalance(secondSelectedToken, [isSwapLoading]);
  const routerContract = useContract(routers, routerAbi, true);
  const t1Contract = useContract(firstSelectedToken, erc20Abi, true);
  const t2Contract = useContract(secondSelectedToken, erc20Abi, true);
  const outputAmount = quote(firstSelectedToken, secondSelectedToken, val1);
  const inputAmount = quote(secondSelectedToken, firstSelectedToken, val2);

  const displayToast = useCallback((msg: string, toastType: 'success' | 'info' | 'error') => {
    setToastMessage(msg);
    setToastType(toastType);
    setShowToast(true);
  }, []);

  const switchSelectedTokens = useCallback(() => {
    const token1 = firstSelectedToken;
    const token2 = secondSelectedToken;

    setFirstSelectedToken(token2);
    setSecondSelectedToken(token1);
  }, [firstSelectedToken, secondSelectedToken]);
  const swapTokens = useCallback(async () => {
    try {
      setIsSwapLoading(true);
      assert.notEqual(toLower(firstSelectedToken), toLower(secondSelectedToken), 'Identical tokens');
      const value0 = (t1Contract ? parseUnits(val1.toString(), await t1Contract.decimals()) : parseEther(val1.toString())).toHexString();

      if (t1Contract) {
        const approvalTx = await t1Contract.approve(routerContract?.address, value0);
        await approvalTx.wait();
        displayToast('spend approved', 'info');
      }

      let swapTx: any;

      const token1 = t1Contract ? await Fetcher.fetchTokenData(chainId, t1Contract.address) : WETH[chainId as keyof typeof WETH];
      const token2 = t2Contract ? await Fetcher.fetchTokenData(chainId, t2Contract.address) : WETH[chainId as keyof typeof WETH];
      const pair = await Fetcher.fetchPairData(token1, token2);
      const trades = Trade.bestTradeExactIn(
        [pair],
        !t1Contract ? CurrencyAmount.ether(value0) : new TokenAmount(token1, value0),
        !t2Contract ? ETHER : token2
      );
      const { args, methodName, value } = Router.swapCallParameters(trades[0], {
        ttl: multiply(txDeadlineInMins, 60),
        allowedSlippage: new Percent(`0x${JSBI.BigInt(slippageTolerance * 100).toString(16)}`, `0x${JSBI.BigInt(100).toString(16)}`),
        recipient: account as string,
        feeOnTransfer: chainId !== 97
      });

      switch (methodName) {
        case 'swapExactETHForTokensSupportingFeeOnTransferTokens': {
          const gas = await routerContract?.estimateGas.swapExactETHForTokensSupportingFeeOnTransferTokens(args[0], args[1], args[2], args[3], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString()
          });
          swapTx = await routerContract?.swapExactETHForTokensSupportingFeeOnTransferTokens(args[0], args[1], args[2], args[3], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString(),
            gasLimit: gas?.toHexString()
          });
          break;
        }
        case 'swapExactETHForTokens': {
          const gas = await routerContract?.estimateGas.swapExactETHForTokens(args[0], args[1], args[2], args[3], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString()
          });
          swapTx = await routerContract?.swapExactETHForTokens(args[0], args[1], args[2], args[3], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString(),
            gasLimit: gas?.toHexString()
          });
          break;
        }
        case 'swapExactTokensForETHSupportingFeeOnTransferTokens': {
          const gas = await routerContract?.estimateGas.swapExactTokensForETHSupportingFeeOnTransferTokens(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            {
              value,
              gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString()
            }
          );
          swapTx = await routerContract?.swapExactTokensForETHSupportingFeeOnTransferTokens(args[0], args[1], args[2], args[3], args[4], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString(),
            gasLimit: gas?.toHexString()
          });
          break;
        }
        case 'swapExactTokensForETH': {
          const gas = await routerContract?.estimateGas.swapExactTokensForETH(args[0], args[1], args[2], args[3], args[4], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString()
          });
          swapTx = await routerContract?.swapExactTokensForETH(args[0], args[1], args[2], args[3], args[4], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString(),
            gasLimit: gas?.toHexString()
          });
          break;
        }
        case 'swapExactTokensForTokensSupportingFeeOnTransferTokens': {
          const gas = await routerContract?.estimateGas.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            {
              value,
              gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString()
            }
          );
          swapTx = await routerContract?.swapExactTokensForTokensSupportingFeeOnTransferTokens(args[0], args[1], args[2], args[3], args[4], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString(),
            gasLimit: gas?.toHexString()
          });
          break;
        }
        case 'swapExactTokensForTokens': {
          const gas = await routerContract?.estimateGas.swapExactTokensForTokens(args[0], args[1], args[2], args[3], args[4], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString()
          });
          swapTx = await routerContract?.swapExactTokensForTokens(args[0], args[1], args[2], args[3], args[4], {
            value,
            gasPrice: parseUnits(gasPrice.toString(), 'gwei').toHexString(),
            gasLimit: gas?.toHexString()
          });
          break;
        }
      }
      await swapTx.wait();

      setIsSwapLoading(false);
      displayToast('transaction executed', 'success');
      clearFields();
    } catch (error: any) {
      setIsSwapLoading(false);
      console.log("Swap Failedddd", error)
      displayToast('transaction execution failed', 'error');
      clearFields();
    }
  }, [
    account,
    chainId,
    displayToast,
    firstSelectedToken,
    gasPrice,
    playSounds,
    routerContract,
    secondSelectedToken,
    slippageTolerance,
    t1Contract,
    t2Contract,
    txDeadlineInMins,
    val1
  ]);

  useEffect(() => {
    setVal2(outputAmount);
  }, [outputAmount]);

  useEffect(() => {
    setVal1(inputAmount);
  }, [inputAmount]);

  useEffect(() => {
    if (tokensListing.length > 1) {
      setFirstSelectedToken(
        inputToken && map(tokensListing, (token) => toLower(token.address)).includes(toLower(inputToken as string))
          ? (inputToken as string)
          : get(tokensListing[0], 'address')
      );
    }
  }, [inputToken, tokensListing]);

  useEffect(() => {
    if (tokensListing.length > 1) {
      setSecondSelectedToken(
        outputToken && map(tokensListing, (token) => toLower(token.address)).includes(toLower(outputToken as string))
          ? (outputToken as string)
          : get(tokensListing[1], 'address')
      );
    }
  }, [outputToken, tokensListing]);

  const clearFields = () => {
    setVal1(0.0);
    setVal2(0.0);
  }

  return (
    <>
      <div className="flex justify-center w-full items-center flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 p-10">
          <div className='rounded-xl bg-[#1a1a1a]'>
            <div className="flex flex-col justify-evenly items-center w-full h-full">
              <div className="flex justify-between w-full py-6 px-3">
                <div className="flex flex-col justify-center items-start">
                  <span className="font-Syne text-4xl text-white font-[700]">Swap</span>
                  <p className="font-[400] font-Poppins text-[0.9em] text-[#9d9d9d]">Trade tokens in an instant</p>
                </div>
                <div className="flex justify-center gap-3 items-center">
                  <button onClick={refresh} className="bg-transparent text-[#FBAA19]/80 text-[1.8em] cursor-pointer">
                    <IoMdRefreshCircle />
                  </button>
                  <button onClick={() => setIsSettingsModalVisible(true)} className="bg-transparent text-[#FBAA19]/80 text-[1.8em]">
                    <FiSettings />
                  </button>
                </div>
              </div>
              <div className="flex flex-col justify-center w-full gap-2 px-2">
                <div className="flex flex-col w-full px-2 py-2 justify-evenly gap-2">
                  <div className="flex justify-between w-full font-Syne">
                    <span className="text-white">From</span>
                    <span className="text-[#c8bfbf]"> Balance: {balance1}</span>
                  </div>
                  <div className="flex justify-between w-full gap-1 items-center rounded-[8px] bg-[#fff]/[.07]">
                    <div
                      className="flex justify-evenly items-center p-4 cursor-pointer gap-2 w-auto"
                      onClick={() => setIsFirstTokensListModalVisible(true)}
                    >
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img src={useTokenImageURI(firstSelectedToken)} alt={firstSelectedTokenDetails?.name} />
                        </div>
                      </div>
                      <span className="text-white uppercase font-[700] text-[1em] font-Syne">{firstSelectedTokenDetails?.symbol}</span>
                      <FiChevronDown className="text-white" />
                    </div>

                    <input
                      type="number"
                      value={val1}
                      min={0}
                      className="p-3 bg-transparent text-white w-1/2 border-0 outline-0 appearance-none font-[600] text-[1em] font-Poppins text-right"
                      onChange={(e) => setVal1(e.target.valueAsNumber || 0.0)}
                    />
                  </div>
                  <div className="flex justify-end items-center w-full gap-1">
                    <button
                      onClick={() => setVal1(multiply(1 / 4, balance1))}
                      className="border border-[#FBAA19] rounded-[8px] px-2 py-1 font-Syne text-[#FBAA19] capitalize font-[400] text-[0.75em]"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => setVal1(multiply(2 / 4, balance1))}
                      className="border border-[#FBAA19] rounded-[8px] px-2 py-1 font-Syne text-[#FBAA19] capitalize font-[400] text-[0.75em]"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setVal1(multiply(3 / 4, balance1))}
                      className="border border-[#FBAA19] rounded-[8px] px-2 py-1 font-Syne text-[#FBAA19] capitalize font-[400] text-[0.75em]"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => setVal1(balance1)}
                      className="border border-[#FBAA19] rounded-[8px] px-2 py-1 font-Syne text-[#FBAA19] capitalize font-[400] text-[0.75em]"
                    >
                      100%
                    </button>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <button onClick={switchSelectedTokens} className="bg-transparent text-[#a6b2ec] text-[1em] rounded-full border border-[#a6b2ec]">
                    <MdArrowDownward />
                  </button>
                </div>
                <div className="flex flex-col w-full px-2 py-2 justify-evenly gap-2">
                  <div className="flex justify-between w-full font-Syne">
                    <span className="text-white">To</span>
                    <span className="text-[#c8bfbf]"> Balance: {balance2}</span>
                  </div>
                  <div className="flex justify-between w-full gap-1 items-center rounded-[8px] bg-[#fff]/[.07]">
                    <div
                      className="flex justify-evenly items-center p-4 cursor-pointer gap-2 w-auto"
                      onClick={() => setIsSecondTokensListModalVisible(true)}
                    >
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img src={useTokenImageURI(secondSelectedToken)} alt={secondSelectedTokenDetails?.name} />
                        </div>
                      </div>
                      <span className="text-white uppercase font-[700] text-[1em] font-Syne">{secondSelectedTokenDetails?.symbol}</span>
                      <FiChevronDown className="text-white" />
                    </div>

                    <input
                      type="number"
                      min={0}
                      value={val2}
                      className="p-3 bg-transparent text-white w-1/2 border-0 outline-0 appearance-none font-[600] text-[1em] font-Poppins text-right"
                      onChange={(e) => setVal2(e.target.valueAsNumber || 0.0)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center w-full items-center my-2 px-2 py-2">
                {pair !== AddressZero ? (
                  <div className="flex justify-start w-full items-start flex-col gap-2 px-3 py-2 font-Poppins">
                    <span className="text-[#d0d0d0] text-[0.75em] font-[400]">Slippage Tolerance: {slippageTolerance}%</span>
                    <div className="flex justify-between w-full items-center font-poppins gap-3">
                      <span className="text-white font-[300]">
                        {val1} {firstSelectedTokenDetails?.symbol}
                      </span>
                      <AiOutlineSwap className="text-[#a6b2ec] font-[400] text-[1.9em]" />
                      <span className="text-white font-[300]">
                        {outputAmount} {secondSelectedTokenDetails?.symbol}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-red-400 font-Poppins text-[15px] capitalize">pair doesn&apos;t exist</span>
                )}
              </div>
              <div className="flex justify-center gap-2 items-center w-full flex-col px-2 py-4">
                <button
                  onClick={swapTokens}
                  disabled={pair === AddressZero || isSwapLoading || val1 <= 0 || val1 > balance1 || !active}
                  className="flex justify-center items-center bg-[#FBAA19] py-4 px-3 text-[0.95em] text-white w-full rounded-[8px] gap-3"
                >
                  <span className="font-Syne">
                    {!active ? 'Wallet not connected' : val1 > balance1 ? `Insufficient ${firstSelectedTokenDetails?.symbol} balance` : 'Swap'}
                  </span>
                  <TailSpin color="#dcdcdc" visible={isSwapLoading} width={20} height={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <Toast message={toastMessage} toastType={toastType} duration={10} onHide={() => setShowToast(false)} show={showToast} />
        <SwapSettingsModal isOpen={isSettingsModalVisible} onClose={() => setIsSettingsModalVisible(false)} />
        <TokensListModal
          isVisible={isFirstTokensListModalVisible}
          onClose={() => setIsFirstTokensListModalVisible(false)}
          onTokenSelected={(token) => setFirstSelectedToken(token)}
          selectedTokens={[firstSelectedToken, secondSelectedToken]}
        />
        <TokensListModal
          isVisible={isSecondTokensListModalVisible}
          onClose={() => setIsSecondTokensListModalVisible(false)}
          onTokenSelected={(token) => setSecondSelectedToken(token)}
          selectedTokens={[firstSelectedToken, secondSelectedToken]}
        />
      </div>
    </>
  );
}
