import type { Metadata } from 'next'
import { WalletProvider } from '@/providers/WalletProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maximus Finance - Maximize Your Avalanche Yields',
  description: 'Leading DeFi yield optimization platform for the Avalanche ecosystem. Find the best yields, stake instantly, and maximize your returns.',
  keywords: 'DeFi, Avalanche, AVAX, Yield Farming, Staking, Crypto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-instrument-sans">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}