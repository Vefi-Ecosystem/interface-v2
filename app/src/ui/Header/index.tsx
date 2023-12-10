"use client"

import React, { ReactElement, useState, useEffect, Children } from 'react';
import { Transition } from '@headlessui/react';
import Link, { LinkProps } from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaWallet } from 'react-icons/fa';
import { RiMenu4Fill } from 'react-icons/ri';
import { FiX, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { formatEthAddress } from 'eth-address';
import { useWeb3Context } from '../../contexts/web3';
import ProviderSelectModal from '../ProviderSelectModal';
import { useCurrentChain } from '../../hooks/global';
import ChainSwitchModal from '../ChainSwitchModal';
import { syne } from '../../fonts';

type ActiveLinkProps = LinkProps & {
  children: ReactElement;
  activeClassName: string;
};

const ActiveLink = ({ children, activeClassName, ...props }: ActiveLinkProps) => {
  const asPath = usePathname()


  const child = Children.only(children);
  const childClassName = child.props.className || '';
  const [className, setClassName] = useState(childClassName);

  useEffect(() => {
    // Check if the router fields are updated client-side
    // Dynamic route will be matched via props.as
    // Static route will be matched via props.href
    const linkPathname = new URL((props.as || props.href) as string, location.href).pathname;

    // Using URL().pathname to get rid of query and hash
    const activePathname = new URL(asPath, location.href).pathname;

    const newClassName = linkPathname === activePathname ? `${childClassName} ${activeClassName}`.trim() : childClassName;

    if (newClassName !== className) {
      setClassName(newClassName);
    }
  }, [asPath, props.as, props.href, childClassName, activeClassName, setClassName, className]);

  return (
    <Link {...props}>
      {React.cloneElement(child, {
        className: className || null
      })}
    </Link>
  );
};

const Header: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [showProviderModal, setShowProviderModal] = useState<boolean>(false);
  const { active, account, error: web3Error, disconnectWallet } = useWeb3Context();
  const selectedChain = useCurrentChain();
  const [showChainSwitchModal, setShowChainSwitchModal] = useState<boolean>(false);
  return (
    <>
      
        <div className="bg-transparent flex flex-row justify-between px-3 py-4 items-center w-full border-b border-[#fff]">
          <div className="flex justify-center items-center cursor-pointer">
            <Link href="/">
              <Image src="/images/logo/vefdefi_logo.svg" alt="vefDefi_logo" width={80} height={40} />
            </Link>
          </div>
          <div className={`md:flex flex-row justify-center items-center hidden gap-3 ${syne.className}`}>
          <ActiveLink activeClassName="bg-[#fbaa19] rounded-md text-[#fff]" href="/trade">
                <span className="text-[#b2b2b2] text-[1em] font-[400] px-2 py-2 capitalize">trade</span>
              </ActiveLink>
              <ActiveLink activeClassName="bg-[#fbaa19] rounded-md text-[#fff]" href="/analytics">
                <span className="text-[#b2b2b2] text-[1em] font-[400] px-2 py-2 capitalize">analytics</span>
              </ActiveLink>
              <ActiveLink activeClassName="bg-[#fbaa19] rounded-md text-[#fff]" href="/launchpad">
                <span className="text-[#b2b2b2] text-[1em] font-[400] px-2 py-2 capitalize">launchpad</span>
              </ActiveLink>
              <ActiveLink activeClassName="bg-[#fbaa19] rounded-md text-[#fff]" href="/staking">
                <span className="text-[#b2b2b2] text-[1em] font-[400] px-2 py-2 capitalize">staking</span>
              </ActiveLink>
            
              <ActiveLink activeClassName="bg-[#fbaa19] rounded-md text-[#fff]" href="/bridge">
                <span className="text-[#b2b2b2] text-[1em] font-[400] px-2 py-2 capitalize">bridge</span>
              </ActiveLink>
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="flex justify-center items-center gap-2 flex-1">
              <button
                onClick={() => setShowChainSwitchModal(true)}
                className="hidden md:flex justify-center items-center bg-[#fff]/[.09] py-[9px] px-[10px] rounded-[8px] text-[1em] text-white gap-2"
              >
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={selectedChain.logoURI} alt={selectedChain.symbol} />
                  </div>
                </div>
                {selectedChain.name} <FiChevronDown />
              </button>

              <div className="dropdown dropdown-hover">
                <button
                  tabIndex={0}
                  onClick={() => !active && setShowProviderModal(true)}
                  className="hidden lg:flex justify-center items-center bg-gradient-to-r from-[#FBAA19] to-[#ee710b] py-[9px] px-[10px] text-[1em] text-white gap-2 rounded-[8px]"
                >
                  {active ? (
                    <>
                      <div className="h-[30px] w-[30px] rounded-[25px] flex justify-center items-center border border-white">
                        <FaWallet />
                      </div>{' '}
                      {formatEthAddress(account as string, 4)} <FiChevronDown />
                    </>
                  ) : (
                    <div className="flex justify-center items-center gap-2">
                      <FaWallet /> Connect Wallet
                    </div>
                  )}
                </button>
                {active && (
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-[#000]/[0.6] rounded-box w-52 text-white">
                    <li>
                      <a onClick={disconnectWallet} className="btn btn-ghost gap-2">
                        {' '}
                        <FiLogOut /> Disconnect
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            </div>
            <div className="lg:hidden flex justify-center items-center gap-2">
              {active && (
                <button
                  onClick={() => setShowChainSwitchModal(true)}
                  className="flex justify-center items-center btn btn-sm btn-ghost btn-square py-2 px-3 rounded-[5px] text-[18px] text-white"
                >
                  <div className="avatar">
                    <div className="w-4 rounded-full">
                      <img src={selectedChain.logoURI} alt={selectedChain.symbol} />
                    </div>
                  </div>
                </button>
              )}
              <button
                onClick={() => (!active ? setShowProviderModal(true) : disconnectWallet())}
                className="flex justify-center items-center bg-[#FBAA19] py-2 px-4 text-[0.52em] text-white gap-2 rounded-[8px]"
              >
                {active ? (
                  <>{formatEthAddress(account as string, 4)}</>
                ) : (
                  <div className="flex justify-center items-center gap-2 capitalize">
                    <FaWallet /> connect wallet
                  </div>
                )}
              </button>
              <button
                className="flex justify-center items-center bg-transparent py-[9px] px-[10px] rounded-[5px] text-[1.6em] text-white"
                onClick={() => setShowMobileSidebar((val) => !val)}
              >
                {!showMobileSidebar ? <RiMenu4Fill /> : <FiX />}
              </button>
            </div>
          </div>
        </div>
      
      <Transition
        as="div"
        className="flex flex-col lg:hidden gap-2 overflow-auto my-auto hidden-scrollbar justify-between items-center w-full px-4 py-4 z-20"
        enter="transform transition ease-in-out duration-[500ms]"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        show={showMobileSidebar}
      >
        <ul
          className="menu bg-[#1a1a1a] mx-auto min-h-full my-auto w-full p-2 rounded-box text-[#fff] font-Syne"
          onClick={() => setShowMobileSidebar(false)}
        >
          <li>
            <ActiveLink activeClassName="active" href="/dex">
              <span className="capitalize">trade</span>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink activeClassName="active" href="/analytics">
              <span className="capitalize">analytics</span>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink activeClassName="active" href="/staking">
              <span className="capitalize">staking pools</span>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink activeClassName="active" href="/launchpad">
              <span className="capitalize">Lauchpad</span>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink activeClassName="active" href="/bridge">
              <span className="capitalize">Bridge</span>
            </ActiveLink>
          </li>
        </ul>
      </Transition>
      <ProviderSelectModal isOpen={showProviderModal} onClose={() => setShowProviderModal(false)} />
      <ChainSwitchModal isOpen={showChainSwitchModal} onClose={() => setShowChainSwitchModal(false)} />
    </>
  );
}

export default Header;
