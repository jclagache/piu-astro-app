import { useState, useEffect } from 'react'
import { PIU_TOKEN_MINT_ADDRESS, SOLANA_RPC_URL } from '@/lib/constants'
import { isValidSolanaAddress } from '@/utils/solana'

export function usePiuBalance(address: string | undefined) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setBalance(null)
      setError(null)
      return
    }

    const fetchPiuBalance = async () => {
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
            method: 'getTokenAccountsByOwner',
            params: [
              address,
              {
                mint: PIU_TOKEN_MINT_ADDRESS,
              },
              {
                encoding: 'jsonParsed',
              },
            ],
          }),
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error.message)
        }

        if (data.result?.value?.length > 0) {
          const tokenAccount = data.result.value[0]
          const amount = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount
          setBalance(amount || 0)
        } else {
          setBalance(0)
        }
      } catch (err) {
        console.error('Error fetching PIU balance:', err)
        setError('Failed to fetch PIU balance')
        setBalance(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPiuBalance()
    const interval = setInterval(fetchPiuBalance, 30000)
    return () => clearInterval(interval)
  }, [address])

  return { balance, isLoading, error }
}