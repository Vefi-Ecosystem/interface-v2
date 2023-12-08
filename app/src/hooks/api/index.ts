import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWeb3Context } from '../../contexts/web3';
import { concat, forEach, toLower } from 'lodash';
import dexListing from '../../config/listing';

interface ListingModel {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

type DexListing = {
  [key: number]: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  }[];
};

const IMPORTED_TOKENS_KEY = 'imported_tokens';

export const useListing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ListingModel[]>([]);
  const { chainId } = useWeb3Context();

  function getListing(chainId: number) {
    const result = (dexListing as DexListing)[chainId]?.sort((a, b) => (a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0));
    return result
  }

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const listing = getListing(chainId)
        setData(listing);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    })();
  }, [chainId]);

  return { isLoading, data };
};

export const useListingAsDictionary = () => {
  const { data } = useImportedTokensWithListing();
  return useMemo(() => {
    let obj: { [key: string]: ListingModel } = {};

    forEach(data, (value) => {
      obj = Object.defineProperty(obj, toLower(value.address), { value });
    });

    return obj;
  }, [data]);
};

export const useTokenDetailsFromListing = (id: string) => {
  const listingDictionary = useListingAsDictionary();
  return useMemo(() => listingDictionary[toLower(id)], [id, listingDictionary]);
};

export const useTokenImageURI = (id: string) => {
  const listingDictionary = useListingAsDictionary();
  return useMemo(() => {
    return listingDictionary[toLower(id)]?.logoURI ?? 'https://i.gifer.com/ZKZg.gif';
  }, [id, listingDictionary]);
};

export const useImportedTokensWithListing = () => {
  const { data } = useListing();
  const [newData, setNewData] = useState<ListingModel[]>([]);

  const importToken = useCallback((model: ListingModel) => {
    if (typeof window !== 'undefined') {
      const importedTokens = localStorage.getItem(IMPORTED_TOKENS_KEY);

      if (importedTokens === null) localStorage.setItem(IMPORTED_TOKENS_KEY, JSON.stringify([model]));
      else localStorage.setItem(IMPORTED_TOKENS_KEY, JSON.stringify([...JSON.parse(importedTokens), model]));

      setNewData((d) => [...d, model]);
    }
  }, []);

  useEffect(() => {
    setNewData(data);
  }, [data]);

  return useMemo(() => {
    if (typeof window !== 'undefined') {
      const importedTokens = localStorage.getItem(IMPORTED_TOKENS_KEY);
      return {
        importToken,
        data: importedTokens === null ? newData : concat(newData, JSON.parse(importedTokens as string) as ListingModel[])
      };
    } else return { importToken, data };
  }, [importToken, newData, data]);
};
