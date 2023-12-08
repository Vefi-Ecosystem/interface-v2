import type { Metadata } from 'next'
import './globals.css'
import Providers from '../providers/Web3'
import Header from '../components/Header'

export const metadata: Metadata = {
  title: 'VefDefi DApps | Homepage',
  description: 'Enjoy Fast Transactions, Security, And Total Ownership Of Your Assets.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
        <body>
          <Header />
          {children}
        </body>
      </Providers>
    </html>
  )
}
