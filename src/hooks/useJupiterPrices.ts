import { useState, useEffect } from 'react'

// Jupiter Price API V3 endpoints
const JUPITER_LITE_API = 'https://lite-api.jup.ag/price/v3'
const JUPITER_PRO_API = 'https://api.jup.ag/price/v3'

// Token mint addresses
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const PIU_MINT = '5eafqp6ic7WpxUsKJLhnLxthUcEYatjhXPNLBRZCpump'

export interface JupiterPriceData {
  usdPrice: number
  blockId: number
  decimals: number
  priceChange24h: number
}

export interface JupiterPrices {
  [mintAddress: string]: JupiterPriceData
}

export function useJupiterPrices() {
  const [prices, setPrices] = useState<JupiterPrices | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Request prices for SOL and PIU tokens
      const response = await fetch(
        `${JUPITER_LITE_API}?ids=${SOL_MINT},${PIU_MINT}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: JupiterPrices = await response.json()
      setPrices(data)
    } catch (err) {
      console.error('Error fetching Jupiter prices:', err)
      setError('Failed to fetch token prices')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    
    // Refresh prices every 10 minutes
    const interval = setInterval(fetchPrices, 600000)
    
    return () => clearInterval(interval)
  }, [])

  // Helper functions to get specific token prices
  const getSolPrice = (): number | null => {
    return prices?.[SOL_MINT]?.usdPrice || null
  }

  const getPiuPrice = (): number | null => {
    return prices?.[PIU_MINT]?.usdPrice || null
  }

  const getSolPriceChange24h = (): number | null => {
    return prices?.[SOL_MINT]?.priceChange24h || null
  }

  const getPiuPriceChange24h = (): number | null => {
    return prices?.[PIU_MINT]?.priceChange24h || null
  }

  return {
    prices,
    isLoading,
    error,
    getSolPrice,
    getPiuPrice,
    getSolPriceChange24h,
    getPiuPriceChange24h,
    refetch: fetchPrices
  }
}
