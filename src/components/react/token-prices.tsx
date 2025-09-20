import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useJupiterPrices } from '@/hooks/useJupiterPrices'

export function TokenPrices() {
  const { 
    getSolPrice, 
    getPiuPrice, 
    getSolPriceChange24h, 
    getPiuPriceChange24h, 
    isLoading, 
    error 
  } = useJupiterPrices()

  const solPrice = getSolPrice()
  const piuPrice = getPiuPrice()
  const solPriceChange24h = getSolPriceChange24h()
  const piuPriceChange24h = getPiuPriceChange24h()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">💰 Token Prices</CardTitle>
          <CardDescription>Loading real-time token prices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">SOL</span>
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">PIU</span>
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">💰 Token Prices</CardTitle>
          <CardDescription>Price data temporarily unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive-foreground">
              ⚠️ Unable to fetch price data from Jupiter API
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">💰 Token Prices</CardTitle>
        <CardDescription>
          Real-time prices powered by <a href="https://dev.jup.ag/docs/price-api/v3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Jupiter API V3</a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SOL Price */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">SOL</span>
              <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground">
                Solana
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                ${solPrice?.toFixed(2) || 'N/A'}
              </div>
              {solPriceChange24h !== null && (
                <div className={`text-sm ${solPriceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {solPriceChange24h >= 0 ? '↗' : '↘'} {solPriceChange24h.toFixed(2)}% (24h)
                </div>
              )}
            </div>
          </div>

          {/* PIU Price */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">PIU</span>
              <Badge variant="outline" className="bg-primary/10 text-primary-foreground">
                PIU Token
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                ${piuPrice?.toFixed(6) || 'N/A'}
              </div>
              {piuPriceChange24h !== null && (
                <div className={`text-sm ${piuPriceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {piuPriceChange24h >= 0 ? '↗' : '↘'} {piuPriceChange24h.toFixed(2)}% (24h)
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
