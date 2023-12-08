import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useGetBridgeTokenList } from '../../hooks/api/bridge';
import { useWeb3Context } from '../../contexts/web3';
import TokenSelect from '../../ui/Bridge/TokenSelect';
import BridgeSelect from '../../ui/Bridge/BridgeSelect';
import SwapSettingsModal from '../../ui/Dex/SwapSettingsModal';
import { useCurrentChain } from '../../hooks/global';
import { ToastContainer, toast } from 'react-toastify';
import { hexValue } from '@ethersproject/bytes';
import CountDown from '../../ui/Countdown';
import { isAfter } from 'date-fns';

function BridgeComponent() {
    const selectedChain = useCurrentChain();
    const { chainId, switchChain } = useWeb3Context();
    const [tokenInfo, setTokenInfo] = useState({
        fromToken: 'Token',
        fromNetwork: selectedChain.name,
        fromTokenImg: '/images/wallet.png',
        fromNetworkImg: selectedChain.logoURI,
        toToken: 'Token',
        toTokenImg: '/images/wallet.png',
        toNetworkImg: '/images/wallet.png',
        toNetwork: 'Network',
    });
    const [showDestinationAddress, setShowDestinationAddress] = useState<boolean>(false);

    // Token Selection State
    const [selectedFromToken, setSelectedFromToken] = useState<any>();
    const [selectedToToken, setSelectedToToken] = useState<any>();
    const [selectedFromNetwork, setSelectedFromNetwork] = useState<any>({
        chain: {
            name: selectedChain.name,
            logoURI: selectedChain.logoURI
        },
        connect: hexValue(chainId),
        chainId: "1"
    });
    const [selectedToNetwork, setSelectedToNetwork] = useState<any>({
        chain: {
            name: selectedChain.name,
            logoURI: selectedChain.logoURI
        },
        connect: null,
        chainId: "1"
    });

    // Token Selection Modal State
    const [showFromTokenModal, setShowFromTokenModal] = useState<boolean>(false);
    const [showToTokenModal, setShowToTokenModal] = useState<boolean>(false);
    const [showFromNetworkModal, setShowFromNetworkModal] = useState<boolean>(false);
    const [showToNetworkModal, setShowToNetworkModal] = useState<boolean>(false);


    const [destinationAddress, setDestinationAddress] = useState<string>('');
    const [toNetworkBtn, setToNetworkBtn] = useState<boolean>(false);
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);


    // Getting Bridge Token List
    const { chainTokenList: fromTokenList } = useGetBridgeTokenList();
    const { chainTokenList: toTokenList } = useGetBridgeTokenList();

    const handleFromTokenSelect = (token: any) => {
        setSelectedFromToken(token)
        setTokenInfo({
            ...tokenInfo,
            fromToken: token.name,
            fromTokenImg: token.logoUrl,
        })
        setShowFromTokenModal(false)
    }

    const handleToTokenSelect = (token: any) => {
        setSelectedToToken(token)
        setTokenInfo({
            ...tokenInfo,
            toToken: token.name,
            toTokenImg: token.logoUrl,
        })
        setShowToTokenModal(false)
        console.log(selectedToToken)
    }


    const handleFromNetworkSelect = (network: any) => {
        setSelectedFromNetwork((prevState: any) => ({ ...prevState, chain: network.chain, connect: network.connect, chainId: network.chainId }))
        setTokenInfo((prevState: any) => ({ ...prevState, fromToken: 'Token', fromTokenImg: '/images/wallet.png' }))
        setTokenInfo({
            ...tokenInfo,
            fromNetwork: network.chain.name,
            fromNetworkImg: network.chain.logoURI,
        })
        switchChain(network.connect)
        setShowFromNetworkModal(false)
    }

    const handleToNetworkSelect = (network: any) => {
        if (network.chainId === chainId) {
            toast.error('Transfer between same networks is unsupported');
            return;
        }
        setSelectedToNetwork((prevState: any) => ({ ...prevState, chain: network.chain, connect: network.connect, chainId: network.chainId }))
        setTokenInfo((prevState: any) => ({ ...prevState, toToken: 'Token', toTokenImg: '/images/wallet.png' }))
        setTokenInfo({
            ...tokenInfo,
            toNetwork: network.chain.name,
            toNetworkImg: network.chain.logoURI,
        })
        setShowToNetworkModal(false)
    }

    const handleSwitch = () => {
        console.log(selectedToNetwork.connect, selectedFromNetwork.connect)
        if (!selectedToNetwork.connect) {
            toast.error('Please select to network');
            return;
        }

        if (!selectedToToken || !selectedFromToken) {
            toast.error('Please select tokens');
            return;
        }

        // Switch Chains
        switchChain(selectedToNetwork.connect)
        setSelectedFromNetwork((prevState: any) => ({ ...prevState, chain: selectedToNetwork.chain, connect: selectedToNetwork.connect, chainId: selectedToNetwork.chainId }))
        setSelectedToNetwork((prevState: any) => ({ ...prevState, chain: selectedFromNetwork.chain, connect: selectedFromNetwork.connect, chainId: selectedFromNetwork.chainId }))

        // Switch Tokens
        setSelectedFromToken((prevState: any) => ({ ...prevState, name: selectedToToken.name, logoUrl: selectedToToken.logoUrl, symbol: selectedToToken.symbol }))
        setSelectedToToken((prevState: any) => ({ ...prevState, name: selectedFromToken.name, logoUrl: selectedFromToken.logoUrl, symbol: selectedFromToken.symbol }))
        setTokenInfo((prevState: any) => ({
            ...prevState,
            fromNetwork: selectedToNetwork.chain.name,
            fromNetworkImg: selectedToNetwork.chain.logoURI,
            toNetwork: selectedFromNetwork.chain.name,
            toNetworkImg: selectedFromNetwork.chain.logoURI,
            fromToken: selectedToToken.name,
            fromTokenImg: selectedToToken.logoUrl,
            toToken: selectedFromToken.name,
            toTokenImg: selectedFromToken.logoUrl,
        }))
    }


    return (
        <div className="container relative mx-auto w-[95%] md:w-2/6 py-15">
            <ToastContainer />
            <div className="text-[rgba(255,255,255,0.7)] bg-[#1a1a1a] h-fit px-10 py-10 rounded-[20px] shadow-md">
                <div className="flex justify-between items-center text-white">
                    <div>
                        <h1 className="text-[25px] text-white font-Syne font-[700]">Transfer</h1>
                    </div>
                    <div className="flex gap-3">
                        <Image src="/images/wallet.png" alt="wallet" width={25} height={25} onClick={() => setShowDestinationAddress(!showDestinationAddress)} className="cursor-pointer" />
                        <Image src="/images/setting.png" alt="wallet" width={25} height={25} className="cursor-pointer" onClick={() => setIsSettingsModalVisible(true)} />
                    </div>
                </div>
                <div className="flex w-full flex-col relative">
                    <span className="my-3 font-Syne text-sm">From</span>
                    <div className="flex justify-between gap-5 bg-[rgba(255,255,255,0.07)] w-full px-5 py-1 rounded-[10px] shadow-md ">
                        <div className="">
                            <div
                                className="flex items-center gap-2 py-2 cursor-pointer"
                                onClick={() => setShowFromTokenModal(true)}
                            >
                                <img src={tokenInfo.fromTokenImg} alt="wallet" width={28} height={28} className={`${tokenInfo.fromTokenImg !== "/images/wallet.png" ? "rounded-full" : ""}`} />
                                <span className="text-sm font-Syne flex items-center gap-1">
                                    {tokenInfo.fromToken} {showFromTokenModal ? <FiChevronUp /> : <FiChevronDown />}
                                </span>
                            </div>
                        </div>
                        <div className="">
                            <div
                                className="flex items-center gap-2 py-2 cursor-pointer"
                                onClick={() => setShowFromNetworkModal(true)}
                            >
                                <img src={tokenInfo.fromNetworkImg} alt="wallet" width={28} height={28} />
                                <span className="text-sm font-Syne flex items-center gap-1">
                                    {tokenInfo.fromNetwork} <FiChevronDown />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center py-5">
                    <Image src="/images/toggle.png" className='cursor-pointer' alt="toggle icon" width={20} height={20}
                        onClick={() => handleSwitch()}
                    />
                </div>
                <div className="flex w-full flex-col">
                    <span className="font-Syne text-sm">To</span>
                    <div className="flex justify-between gap-5 bg-[rgba(255,255,255,0.07)] w-full px-5 py-1 rounded-[10px] shadow-md">
                        <div className="">
                            <div className="flex items-center gap-2 py-2 cursor-pointer"
                                onClick={() => setShowToTokenModal(true)}>
                                <img src={tokenInfo.toTokenImg} alt="wallet" width={28} height={28} className={`${tokenInfo.toTokenImg !== "/images/wallet.png" ? "rounded-full" : ""}`} />
                                <span className="text-sm font-Syne flex items-center gap-1">
                                    {tokenInfo.toToken} {showToTokenModal ? <FiChevronUp /> : <FiChevronDown />}
                                </span>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex items-center gap-2 py-2 cursor-pointer"
                                onClick={() => setShowToNetworkModal(true)}>
                                <img src={tokenInfo.toNetworkImg} alt="wallet" width={28} height={28} />
                                <span className="text-sm font-Syne flex items-center gap-1">
                                    {tokenInfo.toNetwork} <FiChevronDown />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col py-3 px-1">
                    <div className="flex justify-between py-2">
                        <span className="text-[12px]">Total Amount</span>
                        <span className="text-[12px]">Balance: 0.00 {selectedFromToken?.symbol ? selectedFromToken.symbol : "VEF"}</span>
                    </div>
                    <div className="w-full border border-[rgba(255,255,255,0.5)] rounded-[10px] flex items-center p-2 mb-5">
                        <input type="number" name="" id="" className="w-full bg-transparent outline-none border-0 px-2" placeholder="0.0" />
                        <button className="btn bg-transparent border-[rgba(255,255,255,0.2)] border p-2 text-[10px] min-h-0 h-fit">MAX</button>
                    </div>
                    {showDestinationAddress && (
                        <div className="w-full border border-[rgba(255,255,255,0.5)] rounded-[10px] flex items-center p-2 mb-5">
                            <input type="text" name="" id="" className="w-full bg-transparent outline-none border-0 px-2" placeholder="Destination address" value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} />
                        </div>)
                    }
                    <div tabIndex={0} className="collapse collapse-arrow border border-[rgba(255,255,255,0.5)] rounded-[10px] mb-5">
                        <div className="collapse-title text-sm cursor-pointer">You will receive</div>
                        <div className="collapse-content">
                            <div className="text-sm">
                                <div className="flex justify-between py-1">
                                    <span>Slippage</span>
                                    <span>0.5%</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span>Gas on destination</span>
                                    <span>-</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span>Fee</span>
                                    <span>-</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span>Gas cost</span>
                                    <span>-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="bg-[#FBAA19] text-white w-full rounded-[10px] btn capitalize border-0 outline-none">Continue</button>
                </div>
            </div>
            <BridgeSelect
                isVisible={showFromNetworkModal}
                onClose={() => setShowFromNetworkModal(false)}
                selectedBrige={selectedFromNetwork}
                onBridgeSelect={(bridge: any) => handleFromNetworkSelect(bridge)}
            />
            <BridgeSelect
                isVisible={showToNetworkModal}
                onClose={() => setShowToNetworkModal(false)}
                selectedBrige={selectedToNetwork}
                onBridgeSelect={(bridge: any) => handleToNetworkSelect(bridge)}
            />
            <TokenSelect
                chainId={chainId}
                isVisible={showFromTokenModal}
                onClose={() => setShowFromTokenModal(false)}
                onTokenSelected={(token: any) => handleFromTokenSelect(token)}
                selectedToken={selectedFromToken}
                tokenList={fromTokenList}
            />
            <TokenSelect
                chainId={selectedToNetwork.chainId}
                isVisible={showToTokenModal}
                onClose={() => setShowToTokenModal(false)}
                onTokenSelected={(token: any) => handleToTokenSelect(token)}
                selectedToken={selectedToToken}
                tokenList={toTokenList}
            />
            <SwapSettingsModal isOpen={isSettingsModalVisible} onClose={() => setIsSettingsModalVisible(false)} />
        </div>
    )
}

function Render() {
    const today = new Date()
    const launchDate = "2023-7-21"
    const dateForm = new Date(launchDate);

    if (isAfter(today, dateForm)) {
        return <BridgeComponent />
    }

    return (
        <div className='mb-[5rem]'>
            <p className='text-center text-3xl'>Multichain Bridge is Coming Soon</p>
            <CountDown date={launchDate} />
        </div>
    )
}


export default function Multichain() {

    return (
        <>
            <Head>
                <title>Vefi DApps | Multichain Bridge</title>
            </Head>
            <Render />
        </>
    );
}
