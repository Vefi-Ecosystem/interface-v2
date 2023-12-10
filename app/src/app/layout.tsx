import type { Metadata } from 'next'
import './globals.css'
import Providers from '../providers/Web3'
import Header from '../ui/Header'

export const metadata: Metadata = {
  title: 'DApps | Fabulous DeFi experience.',
  description: 'A fabulously delivered platform that meets all your DeFi needs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
        <body className="bg-[#0c0c0c]">
          <div className="container mx-auto min-h-screen">
          <Header />
          {children}
          </div>
        </body>
      </Providers>
    </html>
  )
}
