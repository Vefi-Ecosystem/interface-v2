import Image from "next/image"
import Link from "next/link"
import { PiCaretRightBold } from 'react-icons/pi'

export function Navbar() {
    return (
        <div className="w-full">
            <div className="w-full flex justify-between items-center pt-[1rem] px-5 z-10">
                <Link href="/">
                    <Image src="/3swap.svg" width={796} height={208} alt="3swap" className="w-auto h-10" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="items-center gap-3 hidden sm:flex">
                        <p className="text-white font-bold text-xl">EN</p>
                        <Image src="/bg/world.svg" width={30} height={30} alt="world icon" />
                    </div>
                    <Link href="/" className="px-6 py-2 bg-[#4500A0] text-white rounded-lg shadow-md inline-flex items-center">
                        Launch dApp <PiCaretRightBold />
                    </Link>
                </div>
            </div>
        </div>
    )
}