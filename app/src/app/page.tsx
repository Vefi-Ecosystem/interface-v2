"use client"

import Image from 'next/image';
import Head from 'next/head';
import { Footer } from '../components/Footer';
import Link from 'next/link';
import chains from '../assets/chains.json';
import { map } from 'lodash';
import { FiCheckCircle } from 'react-icons/fi';



export default function Home() {
  const features = [
    {
      title: "Analytics",
      subtitle: 'Fast and Secure Exchange of Digital Assets',
      paragraph: " In-depth periodical market data and token information (with charts) gotten from all trades that have occured on our DEX.",
      linkURl: '/dex',
      linkTitle: "Swap"
    },
    {
      title: "Trade",
      subtitle: 'Unifying Digital Assets for Seamless Transactions',
      paragraph: "Exchange assets or earn LP tokens through liquidity provision on our DEX.",
      linkURl: '/dex',
      linkTitle: "Bridge"
    },
    {
      title: "Staking Pools",
      subtitle: 'Unifying Digital Assets for Seamless Transactions',
      paragraph: " Stake tokens to earn other tokens as rewards. Maximize profit with this scheme.",
      linkURl: '/dex',
      linkTitle: "Bridge"
    }
  ]

  return (
    <>
      <Head>
        <title>3Swap | Dex Aggregator</title>
      </Head>
      <div className="w-full flex flex-col justify-stretch items-center pb-[15rem] relative">
        <Image src="/bg/planet-cut.svg" width={558} height={722} alt='Planet' className='absolute top-0 left-0 z-0' />
        <div className='w-full p-5 mb-[-20rem] flex flex-col items-start gap-y-5 z-10'>
          <h2 className='sm:text-6xl text-5xl sm:leading-[4.5rem] leading-[3rem] text-white mt-[4rem]'>
            <span className='bg-gradient-to-r from-[#FBAA19] to-[#ee710b] drop-shadow-md bg-clip-text text-transparent shadow-purple-600 font-extrabold'> Enjoy Fast Transactions, Security,<br />
              Freedom</span> <br /> & Total Ownership Of Your Assets.</h2>
          <p>Lightning-Fast transactions, secure smart contracts, and complete asset control.</p>
          <Link href="/dex" className="px-6 py-2 bg-gradient-to-r from-[#FBAA19] to-[#ee710b] text-white rounded-lg shadow-md">Launch dApp</Link>
        </div>
        <div className='ml-auto sm:mb-[-10rem] mb-[4rem]'>
          <Image src="/bg/planet.svg" width={1096} height={722} alt='planet image' className='' />
        </div>
        <div className='flex items-center justify-center flex-col'>
          <h3 className='sm:text-4xl text-xl font-extrabold text-center text-white'>
            Enjoy Fast Transactions, Security, And Total Ownership Of Your Assets.
            Lightning-Fast transactions, secure smart contracts, and complete asset control.
          </h3>
          <p className='bg-gradient-to-r from-[#FBAA19] to-[#ee710b] drop-shadow-md bg-clip-text text-transparent text-4xl font-semibold text-center'>VinuChain, Base chains , EVM</p>
        </div>
      </div>
      <div className='w-full'>
        <div className='flex justify-center items-center gap-y-3 flex-col sm:mb-0 mb-[5rem]'>
          <h3 className='bg-gradient-to-r from-[#FBAA19] to-[#ee710b] drop-shadow-md bg-clip-text text-transparent text-center text-4xl font-bold leading-loose'>Many-In-One DApp</h3>
          <p className='text-white text-center'>Decentralized Trade. Token Launch. Multi-Signatory Wallets. Staking Pools. Bridge</p>
        </div>
        <div className="bg-[url('/bg/3d.png')] h-[85vh] w-full bg-no-repeat bg-center bg-cover flex items-center justify-center sm:gap-x-10 gap-y-5 sm:flex-row flex-col p-5">
          {features.map((feature, index) => {
            return (
              <div key={index} className='max-w-[450px] h-[420px] backdrop-blur-lg text-center rounded-xl shadow-xl gap-3 space-y-4 relative'>
                <div className="z-20 flex flex-col items-center justify-center h-full space-y-8 p-3 relative">
                  <h3 className='font-extrabold text-4xl bg-gradient-to-r from-[#FBAA19] to-[#ee710b] drop-shadow-md bg-clip-text text-transparent'>{feature.title}</h3>
                  {/* <p className='font-bold text-white'>{feature.subtitle}</p> */}
                  <p className='text-white'>{feature.paragraph}</p>
                  {/* <Link href={feature.linkURl} className="px-6 py-2 bg-gradient-to-r from-[#FBAA19] to-[#ee710b] text-white rounded-lg shadow-md">{feature.linkTitle}</Link> */}
                </div>
              </div>
            )
          })}
        </div>
        <section className="w-full flex flex-col justify-center items-center gap-6 sm:mb-0 mt-[10rem]">
          <span className="bg-gradient-to-r from-[#FBAA19] to-[#ee710b] drop-shadow-md bg-clip-text text-transparent font-Syne capitalize text-[2.5em] lg:text-[3.5em] text-center lg:max-w-[70rem] font-[700]">
            supported chains
          </span>
          <div className="flex justify-center items-center w-full px-1 lg:px-5">
            <div className="carousel carousel-center px-4 lg:px-8 space-x-3 rounded-box">
              {map(Object.values(chains), (chain, index) => (
                <div key={index} className="carousel-item flex justify-center gap-2 text-white text-[1em] items-center font-Poppins lg:w-1/5">
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src={chain.logoURI} alt={chain.name} />
                    </div>
                  </div>
                  <span>{chain.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="flex flex-col w-full justify-center items-center gap-16 p-4 lg:p-5 mt-10">
          <div className="flex flex-col lg:flex-row justify-center items-center gap-12 w-full">
            <div className="flex flex-col justify-center items-center gap-4 w-full lg:w-auto text-center">
              <span className="font-Syne text-[2.5em] lg:text-[4em] capitalize font-[700] bg-gradient-to-r from-[#FBAA19] to-[#ee710b] drop-shadow-md bg-clip-text text-transparent lg:max-w-[38rem]">
                Fully decentralized. completely secure
              </span>
              <p className="text-[#a49999] font-Poppins text-[1em] lg:max-w-[38rem]">
                VefDefi aims to connect all isolated blockchains and establish a cross-chain assets exchange, providing underlying support for the
                ecosystem. Experience lightning-fast transactions, unparalleled security, and complete ownership of your assets.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full gap-3 capitalize">
            <div className="flex justify-evenly items-center gap-2 w-full flex-col lg:flex-row px-2 lg:px-10">
              <div className="flex justify-start items-center w-full lg:w-1/3 gap-2 px-3 py-3 self-stretch bg-[#fff]/[.06] order-[0] rounded-[10px]">
                <FiCheckCircle className="text-[#ee710b]" />
                <span className="font-[500] font-Syne text-[0.95em] text-[#fff]">instant trades</span>
              </div>
              <div className="flex justify-start items-center w-full lg:w-1/3 gap-2 px-3 py-3 self-stretch bg-[#fff]/[.06] order-[0] rounded-[10px]">
                <FiCheckCircle className="text-[#ee710b]" />
                <span className="font-[500] font-Syne text-[0.95em] text-[#fff]">secure smart contracts</span>
              </div>
            </div>
            <div className="flex justify-evenly items-center gap-2 w-full flex-col lg:flex-row px-2 lg:px-10">
              <div className="flex justify-start items-center w-full lg:w-1/3 gap-2 px-3 py-3 self-stretch bg-[#fff]/[.06] order-[0] rounded-[10px]">
                <FiCheckCircle className="text-[#ee710b]" />
                <span className="font-[500] font-Syne text-[0.95em] text-[#fff]">community-driven</span>
              </div>
              <div className="flex justify-start items-center w-full lg:w-1/3 gap-2 px-3 py-3 self-stretch bg-[#fff]/[.06] order-[0] rounded-[10px]">
                <FiCheckCircle className="text-[#ee710b]" />
                <span className="font-[500] font-Syne text-[0.95em] text-[#fff]">accurate analytics</span>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  )
}
