import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppKitAccount } from '@reown/appkit/react'
import { useSolanaBalance } from '@/hooks/useSolanaBalance'
import { usePiuBalance } from '@/hooks/usePiuBalance'
import { useJupiterPrices } from '@/hooks/useJupiterPrices'
import { getWalletAddress } from '@/utils/solana'

export function AdvancedAnalytics() {
  const { address, isConnected, caipAddress } = useAppKitAccount()
  const walletAddress = getWalletAddress(address, caipAddress)
  
  const { balance: solBalance, isLoading: solLoading } = useSolanaBalance(walletAddress)
  const { balance: piuBalance, isLoading: piuLoading } = usePiuBalance(walletAddress)
  const { 
    getSolPrice, 
    getPiuPrice, 
    getSolPriceChange24h, 
    getPiuPriceChange24h, 
    isLoading: pricesLoading, 
    error: pricesError 
  } = useJupiterPrices()
  
  const isLoading = solLoading || piuLoading || pricesLoading
  
  // Get real-time prices from Jupiter API
  const solPrice = getSolPrice()
  const piuPrice = getPiuPrice()
  const solPriceChange24h = getSolPriceChange24h()
  const piuPriceChange24h = getPiuPriceChange24h()
  
  const solValue = solPrice ? (solBalance || 0) * solPrice : 0
  const piuValue = piuPrice ? (piuBalance || 0) * piuPrice : 0
  const portfolioValue = solValue + piuValue
  
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-secondary">📊 Advanced Analytics</CardTitle>
          <CardDescription>
            Connect your wallet to view detailed portfolio analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Connect your wallet to access analytics</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-secondary">📊 Advanced Analytics</CardTitle>
          <CardDescription>
            Loading portfolio analytics...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="font-medium">Portfolio Value</span>
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="font-medium">SOL Balance</span>
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="font-medium">PIU Balance</span>
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary">📊 Advanced Analytics</CardTitle>
        <CardDescription>
          Real-time portfolio analytics and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="font-medium">Portfolio Value</span>
            <span className="text-primary font-bold">
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="font-medium">SOL Balance</span>
            <div className="text-right">
              <div className="font-bold">{solBalance?.toFixed(4) || '0.0000'} SOL</div>
              <div className="text-sm text-muted-foreground">
                ${solValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {solPrice && (
                <div className="text-xs text-muted-foreground">
                  ${solPrice.toFixed(2)}/SOL
                  {solPriceChange24h !== null && (
                    <span className={`ml-1 ${solPriceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({solPriceChange24h >= 0 ? '+' : ''}{solPriceChange24h.toFixed(2)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="font-medium">PIU Holdings</span>
            <div className="text-right">
              <div className="font-bold text-accent">
                {piuBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} PIU
              </div>
              <div className="text-sm text-muted-foreground">
                ${piuValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {piuPrice && (
                <div className="text-xs text-muted-foreground">
                  ${piuPrice.toFixed(6)}/PIU
                  {piuPriceChange24h !== null && (
                    <span className={`ml-1 ${piuPriceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({piuPriceChange24h >= 0 ? '+' : ''}{piuPriceChange24h.toFixed(2)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="font-medium">Status</span>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              {piuBalance && piuBalance > 0 ? 'PIU Holder' : 'No PIU Tokens'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
