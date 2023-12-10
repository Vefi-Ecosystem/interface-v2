import Link from "next/link"
import { PiCaretRightBold } from 'react-icons/pi'
import Toast from 'awesome-toast-component'

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="h-fit py-[3.5rem] sm:px-10 px-7 w-full flex justify-center flex-col items-center gap-y-2 text-white">
            <div className="bg-gradient-to-r from-[#FBAA19] to-[#ee710b] sm:h-[35vh] h-[45vh] w-[85%] mx-auto flex flex-col items-center justify-center gap-y-3 rounded-lg">
                <h3 className="font-bold sm:text-3xl Nunito_Sans text-center">Subscribe to VefDefi newsletter</h3>
                <p>Get the latest news and updates</p>
                <button onClick={() => {
                    new Toast("Feature in Development")
                }} className="inline-flex justify-center gap-x-1 py-4 sm:px-[5rem] px-12 border rounded-[20px] border-white items-center sm:text-semibold text-sm">
                    Subscribe <PiCaretRightBold />
                </button>
            </div>
            <p className="text-white font-medium text-md">&copy; {currentYear} VefDefi, All Rights Reserved.</p>
        </div>
    )
}