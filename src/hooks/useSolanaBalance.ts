import { useState, useEffect } from 'react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { isValidSolanaAddress } from '@/utils/solana'
import { getSolanaConnection } from '@/utils/rpc'

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

        // Validate address format
        if (!isValidSolanaAddress(address)) {
          throw new Error(`Invalid Solana address format: ${address}`)
        }

        // Create connection to Solana with fallback
        const connection = await getSolanaConnection()
        
        // Create public key from address string
        const publicKey = new PublicKey(address!)
        if (!publicKey) {
          throw new Error(`Failed to create PublicKey from address: ${address}`)
        }
        
        // Get balance in lamports
        const balanceInLamports = await connection.getBalance(publicKey)
        
        // Convert to SOL (1 SOL = 1e9 lamports)
        const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL
        
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
    
    // Optional: Set up interval to refresh balance periodically
    const interval = setInterval(fetchBalance, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [address])

  return { balance, isLoading, error }
}
