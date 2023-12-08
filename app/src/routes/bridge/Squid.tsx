import { SquidWidget } from "@0xsquid/widget";

export default function Squid() {
    return (
        <div className="flex justify-center items-center">
            <SquidWidget config={
                {
                    "integratorId": "Vefi-swap-widget",
                    "companyName": "Custom",
                    "style": {
                        "neutralContent": "#959BB2",
                        "baseContent": "#E8ECF2",
                        "base100": "#10151B",
                        "base200": "#272D3D",
                        "base300": "#171D2B",
                        "error": "#ED6A5E",
                        "warning": "#FFB155",
                        "success": "#2EAEB0",
                        "primary": "#71B4BD",
                        "secondary": "#71B4BD",
                        "secondaryContent": "#191C29",
                        "neutral": "#191C29",
                        "roundedBtn": "5px",
                        "roundedCornerBtn": "999px",
                        "roundedBox": "5px",
                        "roundedDropDown": "7px"
                    },
                    "slippage": 1.5,
                    "infiniteApproval": false,
                    "enableExpress": true, 
                    "mainLogoUrl": "https://dapps.vefinetwork.org/images/vefi.svg",
                    "apiUrl": "https://api.squidrouter.com",
                    "comingSoonChainIds": [
                        "cosmoshub-4",
                        "injective-1",
                        "kichain-2"
                    ],
                    "titles": {
                        "swap": "Swap",
                        "settings": "Settings",
                        "wallets": "Wallets",
                        "tokens": "Select Token",
                        "chains": "Select Chain",
                        "history": "History",
                        "transaction": "Transaction",
                        "allTokens": "Select Token",
                        "destination": "Destination address"
                    },
                    "priceImpactWarnings": {
                        "warning": 3,
                        "critical": 5
                    }
                }
            } />
        </div>
    )
}