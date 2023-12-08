import { useMemo } from 'react';
import { useWeb3Context } from '../contexts/web3';
import { getContract } from '../utils';
import { get, map } from 'lodash';
import { GraphQLClient } from 'graphql-request';
import chains from '../assets/chains.json';

export const useContract = (addressOrAddressMap: string | { [chainId: number | string]: string }, ABI: any, withSignerIfPossible = true) => {
  const { account, library, chainId } = useWeb3Context();

  return useMemo(() => {
    let address: string | undefined;

    if (!ABI || !library || !addressOrAddressMap) return null;

    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];

    if (!address) return null;
    try {
      return getContract(address as string, ABI, library as any, withSignerIfPossible && account ? account : undefined);
    } catch (error: any) {
      console.error('failed to get contract ', error);
      return null;
    }
  }, [account, addressOrAddressMap, chainId, library, withSignerIfPossible, ABI]);
};

export const useContracts = (addressesOrAddressMaps: (string | { [chainId: number | string]: string })[], ABI: any, withSignerIfPossible = true) => {
  const { account, library, chainId } = useWeb3Context();

  return useMemo(() => {
    if (!ABI || !library || !addressesOrAddressMaps) return null;
    return map(addressesOrAddressMaps, (addressOrAddressMap) => {
      let address: string | undefined;
      if (!addressOrAddressMap) return null;
      if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
      else address = addressOrAddressMap[chainId];

      if (!address) return null;

      try {
        return getContract(address as string, ABI, library as any, withSignerIfPossible && account ? account : undefined);
      } catch (error: any) {
        console.error('failed to get contract ', error);
        return null;
      }
    });
  }, [ABI, account, addressesOrAddressMaps, chainId, library, withSignerIfPossible]);
};

export const useGQLClient = (
  uriOrUriMap: string | { [chainId: number | string]: { root: string; slugs: { [key: string]: string } } },
  slug: string
) => {
  const { chainId } = useWeb3Context();
  return useMemo(() => {
    let uri: string | undefined;

    if (!uriOrUriMap) return null;

    if (typeof uriOrUriMap === 'string') uri = uriOrUriMap;
    else {
      const fromMap = get(uriOrUriMap, chainId);
      if (!fromMap) return null;
      if (!fromMap.slugs[slug]) return null;

      uri = fromMap.root + fromMap.slugs[slug];
    }

    if (!uri) return null;

    return new GraphQLClient(uri);
  }, [chainId, slug, uriOrUriMap]);
};

export const useCurrentChain = () => {
  const { chainId } = useWeb3Context();
  return useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
};

export const useExplorerLink = (subroute: 'tx' | 'address', extra: string) => {
  const currentChain = useCurrentChain();
  return useMemo(() => currentChain.explorer.concat('/', subroute).concat('/', extra), [currentChain.explorer, extra, subroute]);
};
