"use client"

import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import ToggleButton from '../../ui/Button/ToggleButton';
import { Liquidity, Swap } from '../../routes/dex';


enum Route {
    SWAP = 'swap',
    LIQUIDITY = 'liquidity',
    AGGREGATOR = 'aggregator'
}

const useDEXSubRoutes = (routes: Route) => {
    const [component, setComponent] = useState(() => Swap);

    useEffect(() => {
        switch (routes) {
            case Route.SWAP:
                setComponent(() => Swap);
                break;
            case Route.LIQUIDITY:
                setComponent(() => Liquidity);
                break;
            default:
                setComponent(() => Swap);
                break;
        }
    }, [routes]);
    return component;
};

export default function Dex() {
    const { push } = useRouter();
    const params = useSearchParams()
    const tab = params.get('tab')
    const RenderedChild = useDEXSubRoutes(tab as Route);
    const route = useMemo(() => (tab as Route) || Route.SWAP, [tab]);

    useEffect(() =>{
        document.title = "VefDefi Dapps | DEX"
    },[])

    return (
        <>
            <Head>
                <title>Vefi DApps | DEX</title>
            </Head>
            <div className="flex justify-center items-center py-12 w-full">
                <div className="flex justify-center items-center rounded-[30px] bg-[#fff]/[.11] py-1 px-1">
                    <ToggleButton isActive={route === Route.SWAP} onClick={() => push(`/trade?tab=${Route.SWAP}`)}>
                        <span className="capitalize">single source swap</span>
                    </ToggleButton>
                    <ToggleButton isActive={route === Route.AGGREGATOR} onClick={() => push(`/trade?tab=${Route.AGGREGATOR}`)}>
                        <span className="capitalize">aggregator</span>
                    </ToggleButton>
                    <ToggleButton isActive={route === Route.LIQUIDITY} onClick={() => push(`/trade?tab=${Route.LIQUIDITY}`)}>
                        <span className="capitalize">liquidity</span>
                    </ToggleButton>
                </div>
            </div>
            <div className="flex justify-center items-center my-16 px-2 w-full">
                <RenderedChild />
            </div>
        </>
    );
}
