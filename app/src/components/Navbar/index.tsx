import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { FaWallet } from "react-icons/fa6";
import { RiMenu4Fill } from "react-icons/ri";

const links = [
    {
        title: "Trade",
        url: '/swap'
    },
    {
        title: 'Analytics',
        url: "/analytics"
    },
    {
        title: 'Launchpad',
        url: '/launchpad'
    },
    {
        title: 'Staking Pool',
        url: '/staking-pool'
    },
    {
        title: 'Bridge',
        url: '/bridge'
    }
]

export default function Navbar() {
    const [bgOpen, setBgOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <div className="w-full flex justify-between items-center pt-[1rem] px-5 z-10">
            <Link href="/">
                <Image src="/logo/vefdefi_logo.svg" width={796} height={208} alt="3swap" className="w-auto h-10" />
            </Link>
            <div className={`items-center gap-3 sm:flex hidden`}>
                {links.map((link, index) => {
                    return (
                        <Link key={index} href={link.url} className="px-6 py-2 text-white rounded-lg shadow-md inline-flex items-center">
                            {link.title}
                        </Link>
                    )
                })}
            </div>
            <div className="flex justify-center items-center gap-x-4">
                <div>
                    <button className="flex items-center justify-center gap-x-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md">
                        <FaWallet />
                        Connect Wallet
                    </button>
                </div>
                <div className="sm:hidden flex relative">
                    <RiMenu4Fill onClick={() => setOpenMenu(false)} size={30} />
                    <div className="w-full h-full absolute z-20 bg-white top-0">

                    </div>
                </div>
            </div>
        </div>
    )
}