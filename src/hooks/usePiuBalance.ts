import { useState, useEffect } from 'react'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { PIU_TOKEN_MINT_ADDRESS } from '@/lib/constants'
import { isValidSolanaAddress } from '@/utils/solana'
import { getSolanaConnection } from '@/utils/rpc'

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

        // Validate address format
        if (!isValidSolanaAddress(address)) {
          throw new Error(`Invalid Solana address format: ${address}`)
        }

        // Create connection to Solana with fallback
        const connection = await getSolanaConnection()
        
        // Create public keys with validation
        const walletPublicKey = new PublicKey(address!)
        const mintPublicKey = new PublicKey(PIU_TOKEN_MINT_ADDRESS)
        
        if (!walletPublicKey) {
          throw new Error(`Failed to create PublicKey from wallet address: ${address}`)
        }
        
        if (!mintPublicKey) {
          throw new Error(`Failed to create PublicKey from token mint: ${PIU_TOKEN_MINT_ADDRESS}`)
        }
        
        // Get associated token account address
        const associatedTokenAddress = await getAssociatedTokenAddress(
          mintPublicKey,
          walletPublicKey
        )
        
        try {
          // Get token account info
          const tokenAccount = await getAccount(connection, associatedTokenAddress)
          
          // PIU has 6 decimals (you may need to adjust this)
          const balance = Number(tokenAccount.amount) / Math.pow(10, 6)
          setBalance(balance)
        } catch (tokenAccountError) {
          // Token account doesn't exist, balance is 0
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
    
    // Optional: Set up interval to refresh balance periodically
    const interval = setInterval(fetchPiuBalance, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [address])

  return { balance, isLoading, error }
}
