"use client"
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { map, mapValues } from 'lodash';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import type Web3 from 'web3';
import { OkxWalletConnector } from '../web3/custom/OkxWalletConnector';
import chains from '../assets/chains.json';

type Web3ContextType = {
  account?: string | null;
  library?: Web3;
  chainId: number;
  active: boolean;
  error?: Error;
  connectInjected: () => void;
  connectWalletConnect: () => void;
  connectTorus: () => void;
  connectOkxWallet: () => void;
  disconnectWallet: () => void;
  switchChain: (chainId: string) => void;
};

const Web3Context = createContext<Web3ContextType>({} as Web3ContextType);

const injectedConnector = new InjectedConnector({
  supportedChainIds: map(Object.keys(chains), (key) => parseInt(key))
});

const okxwalletConnector = new OkxWalletConnector({
  supportedChainIds: map(Object.keys(chains), (key) => parseInt(key))
});

const walletConnectConnector = new WalletConnectConnector({
  qrcode: true,
  bridge: 'https://bridge.walletconnect.org',
  supportedChainIds: map(Object.keys(chains), (key) => parseInt(key)),
  rpc: mapValues(chains, (item) => item.rpcUrl)
});

const torusConnector = new TorusConnector({
  chainId: 1
});

export const Web3ContextProvider = ({ children }: any) => {
  const { library, account, activate, deactivate, active, chainId: web3ChainId, error, setError } = useWeb3React<Web3>();
  const [chainId, setChainId] = useState<number>(1);
  const [ethereumProvider, setEthereumProvider] = useState<any>(null);

  const connectInjected = useCallback(() => {
    activate(injectedConnector, setError, true)
      .then(() => {
        setEthereumProvider((window as any).ethereum);
      })
      .catch(setError);
  }, []);

  const connectWalletConnect = useCallback(() => {
    activate(walletConnectConnector, setError, true)
      .then(() => {
        setEthereumProvider((window as any).ethereum);
      })
      .catch(setError);
  }, []);

  const connectTorus = useCallback(() => {
    activate(torusConnector, setError, true)
      .then(() => {
        console.log('Torus connected!');
      })
      .catch(setError);
  }, []);

  const connectOkxWallet = useCallback(() => {
    activate(okxwalletConnector, setError, true)
      .then(() => {
        setEthereumProvider((window as any).okxwallet);
      })
      .catch(setError);
  }, []);

  const disconnectWallet = useCallback(() => {
    if (active) deactivate();
  }, [active]);

  const switchChain = useCallback(
    async (chain: string) => {
      if (active) {
        try {
          if (ethereumProvider) {
            await ethereumProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chain }]
            });
            setChainId(parseInt(chain));
          } else {
            setChainId(parseInt(chain));
          }
        } catch (error: any) {
          if (error.code === 4902 || error.code === -32603) {
            const c = chains[parseInt(chain, 16) as unknown as keyof typeof chains];
            await ethereumProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chain,
                  chainName: c.name,
                  rpcUrls: [c.rpcUrl],
                  blockExplorerUrls: [c.explorer],
                  nativeCurrency: {
                    symbol: c.symbol,
                    decimals: 18
                  }
                }
              ]
            });
          }
        }
      } else {
        setChainId(parseInt(chain));
      }
    },
    [active, ethereumProvider]
  );

  useEffect(() => {
    injectedConnector.isAuthorized().then((isAuth:any) => {
      if (isAuth) {
        activate(injectedConnector, setError, true)
          .then(() => {
            setEthereumProvider((window as any).ethereum);
          })
          .catch(setError);
      }
    });
  }, []);

  useEffect(() => {
    okxwalletConnector.isAuthorized().then((isAuth) => {
      if (isAuth) {
        activate(okxwalletConnector, setError, true)
          .then(() => {
            setEthereumProvider((window as any).okxwallet);
          })
          .catch(setError);
      }
    });
  }, []);

  useEffect(() => {
    if (active && web3ChainId) {
      setChainId(web3ChainId);
    }
  }, [web3ChainId, active]);

  return (
    <Web3Context.Provider
      value={{
        library,
        account,
        active,
        connectInjected,
        connectWalletConnect,
        connectTorus,
        connectOkxWallet,
        error,
        disconnectWallet,
        chainId,
        switchChain
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context = () => {
  return useContext(Web3Context);
};
