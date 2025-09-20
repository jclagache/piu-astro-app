import { useState, useEffect } from 'react'
import { SOLANA_RPC_URL } from '@/lib/constants'
import { isValidSolanaAddress } from '@/utils/solana'

export function useSolanaBalance(address: string | undefined) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setBalance(null)
      setError(null)
      return
    }

    const fetchBalance = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!isValidSolanaAddress(address)) {
          throw new Error(`Invalid Solana address format: ${address}`)
        }

        const response = await fetch(SOLANA_RPC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address],
          }),
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error.message)
        }

        const balanceInLamports = data.result.value
        const balanceInSol = balanceInLamports / 1000000000 // 1 SOL = 1e9 lamports
        setBalance(balanceInSol)
      } catch (err) {
        console.error('Error fetching balance:', err)
        setError('Failed to fetch balance')
        setBalance(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [address])

  return { balance, isLoading, error }
}