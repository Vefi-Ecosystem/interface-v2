import React, { Fragment } from 'react';
import { FiX } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import { useWeb3Context } from '../../contexts/web3';

type ProviderSelectModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProviderSelectModal({ isOpen = false, onClose }: ProviderSelectModalProps) {
  const { connectInjected, connectTorus, connectWalletConnect, connectOkxWallet } = useWeb3Context();
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-[#000]/[.95]" aria-hidden="true" />
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="container  top-0 bottom-0 left-0 right-0 w-[400px] mx-auto overflow-hidden  bg-[#1a1a1a] mix-blend-normal rounded-[20px] backdrop-blur-[64px] text-white">
                  <div className="bg-transparent p-[30px]">
                    <div className="flex flex-row items-center justify-between">
                      <h2 className="text-2xl font-[700] font-Syne">Select Provider</h2>
                      <button
                        onClick={onClose}
                        className="text-[#eaebec]/[.49] text-[0.67em] border border-[#eaebec]/[.49] p-1 flex justify-center rounded-full font-[700]"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                  <div className="px-[20px] py-[10px]">
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex w-full justify-evenly gap-2">
                        <button
                          onClick={() => {
                            connectInjected();
                            onClose();
                          }}
                          className="w-1/2 px-3 py-4 flex justify-center items-center"
                        >
                          <img src="/images/metamask.svg" className="w-full h-[5rem]" alt="metamask" />
                        </button>
                        <button
                          onClick={() => {
                            connectWalletConnect();
                            onClose();
                          }}
                          className="w-1/2 px-3 py-4 flex justify-center items-center"
                        >
                          <img src="/images/wallet.svg" className="w-full h-[5rem]" alt="wallet_connect" />
                        </button>
                      </div>
                      <div className="flex w-full justify-evenly gap-2">
                        <button
                          onClick={() => {
                            connectInjected();
                            onClose();
                          }}
                          className="w-1/2 px-3 py-4 flex justify-center items-center"
                        >
                          <img src="/images/trustwallet.svg" className="w-full h-[5rem]" alt="trust_wallet" />
                        </button>
                        <button
                          onClick={() => {
                            connectTorus();
                            onClose();
                          }}
                          className="w-1/2 px-3 py-4 flex justify-center items-center"
                        >
                          <img src="/images/torus.svg" className="w-full h-[5rem]" alt="torus" />
                        </button>
                      </div>
                      <div className="flex w-full justify-center">
                        <button
                          onClick={() => {
                            connectOkxWallet();
                            onClose();
                          }}
                          className="w-1/3 px-3 py-4 flex justify-center items-center"
                        >
                          <img src="/images/okx.webp" className="w-full h-[5rem]" alt="okx_wallet" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
