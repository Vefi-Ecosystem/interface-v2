"use client"

import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';
import { DEXSettingsContextProvider } from '../../contexts/dex/settings';
import { Web3ContextProvider } from '../../contexts/web3';
import { GQLProvider } from '../../contexts/graphql';

function getLibrary(provider: any) {
    return new Web3(provider);
}

export default function Providers({ children }: any) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ContextProvider>
                <GQLProvider>
                    <DEXSettingsContextProvider>
                        {children}
                    </DEXSettingsContextProvider>
                </GQLProvider>
            </Web3ContextProvider>
        </Web3ReactProvider>
    )
}