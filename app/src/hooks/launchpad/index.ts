import { useContract } from "../global";
import { useState, useEffect } from "react";
import { abi as erc20Abi } from "quasar-v1-core/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json";
import launchpadContract from "../../abis/launchpad/PresaleFactory.json"
import presale from "../../abis/launchpad/Presale.json";
import presaleFactories from "../../assets/presaleFactories.json";
import { getDates } from "../../utils";
import { differenceInDays } from 'date-fns';

export const useGetIDOTokenInfo = (contractAddress: string) => {
    const [idoInfo, setIdoInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const tokenInfo = useContract(contractAddress, erc20Abi, false);
    const tokenIDOInfo = useContract(contractAddress, presale, false);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const tokenName = (tokenInfo?.name());
                const tokenSymbol = (tokenInfo?.symbol());
                const decimals = (tokenInfo?.decimals());
                const tokenTotalSupply = (tokenInfo?.totalSupply());
                const startTime = (tokenIDOInfo?.startTime());
                const endTime = (tokenIDOInfo?.endTime());
                const salePrice = (tokenIDOInfo?.salePrice());
                const softCap = (tokenIDOInfo?.minTotalPayment());
                const hardCap = (tokenIDOInfo?.maxTotalPayment());
                const purchaserCount = (tokenIDOInfo?.purchaserCount());
                const { startDate, endDate } = getDates(startTime, endTime);
                const daysDifference = differenceInDays(endDate, startDate);



                setIdoInfo({
                    tokenName,
                    tokenSymbol,
                    decimals,
                    tokenTotalSupply,
                    startTime,
                    endTime,
                    salePrice,
                    softCap,
                    hardCap,
                    purchaserCount,
                    daysDifference
                })
                setIsLoading(false);
            } catch (error: any) {
                setIsLoading(false);
                setIdoInfo(null);
                console.error('An error occurred while fetching IDO Information ', error);
            }
        })

    }, [])

    return {
        isLoading,
        idoInfo
    };
}

export const useGetAllIDO = () => {
    const [allIDO, setAllIDO] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const contract = useContract(presaleFactories, launchpadContract, false);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const allIDO = (contract?.getDeployedPresales());
                setAllIDO(allIDO);
                setIsLoading(false);
            } catch (error: any) {
                setIsLoading(false);
                console.error('An error occurred while fe.tching all IDO ', error);
            }
        })
    }, [])

    return {
        isLoading,
        allIDO
    }
}

export const useGetCurrentBNBPrice = () => {
    const [currentBNBPrice, setCurrentBNBPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchBNBPrice = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`);
                const data = await response.json();
                setCurrentBNBPrice(data.binancecoin.usd.toFixed(2));
                setIsLoading(false);
            } catch (error: any) {
                setIsLoading(false);
                console.error('An error occurred while fetching current BNB price ', error);
            }
        };

        fetchBNBPrice();

    }, []);

    return {
        isLoading,
        currentBNBPrice
    };
};