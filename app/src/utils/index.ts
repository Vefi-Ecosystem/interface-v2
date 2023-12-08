import { isAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import type Web3 from 'web3';

export async function addToMetamask(address: string, symbol: string, decimals: number, image?: string) {
  try {
    if ((window as any).ethereum) {
      await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address, symbol, decimals, image } }
      });
    }
  } catch (error: any) {
    console.log(error);
  }
}

export function getContract(address: string, ABI: any, library: Web3, account?: string) {
  if (!isAddress(address) || address === AddressZero) throw new Error(`Invalid address: ${address}`);

  const libraryOrSigner = account ? new Web3Provider(library.givenProvider).getSigner() : new Web3Provider(library.givenProvider);

  return new Contract(address, ABI, libraryOrSigner);
}

export function getPair(address1: string, address2: string) {
  if (!isAddress(address1) || !isAddress(address2)) throw new Error('Invalid address');
}

export function sanitizeInput(e: any) {
  const result = e?.target?.value.replace(/[^a-z0-9]/gi, '');
  return result;
}

export function getDates(startTime: number, endTime: number) {
  const startDate = new Date(startTime * 1000);
  const endDate = new Date(endTime * 1000);

  return {
    startDate,
    endDate,
  }
}
