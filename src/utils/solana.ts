import { PublicKey } from '@solana/web3.js'

/**
 * Validates if a string is a valid Solana public key
 */
export function isValidSolanaAddress(address: string | undefined): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

/**
 * Formats a Solana address for display
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

/**
 * Extracts the actual wallet address from CAIP address format
 * CAIP format: chainNamespace:chainId:address
 * But Reown seems to use: namespace:namespace:chainId:address (4 parts)
 * Example: solana:solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:27BM25F81ao2VvFvzXA7pYddxH7QyUDDtwMnR35q9KEE
 */
export function extractAddressFromCaip(caipAddress: string | undefined): string | undefined {
  if (!caipAddress || typeof caipAddress !== 'string') {
    return undefined
  }

  // Split CAIP format
  const parts = caipAddress.split(':')
  
  // Handle different CAIP formats
  if (parts.length >= 4) {
    // Reown format: namespace:namespace:chainId:address (4 parts)
    return parts[3]
  } else if (parts.length >= 3) {
    // Standard CAIP format: namespace:chainId:address (3 parts)
    return parts[2]
  }

  // If it's not in CAIP format, assume it's already a plain address
  return caipAddress
}

/**
 * Gets the actual wallet address from AppKit data
 */
export function getWalletAddress(address: string | undefined, caipAddress: string | undefined): string | undefined {
  // Don't log if both are undefined (no wallet connected)
  if (!address && !caipAddress) {
    return undefined
  }
  
  // Try CAIP address first (more reliable)
  if (caipAddress) {
    const extracted = extractAddressFromCaip(caipAddress)
    if (extracted && isValidSolanaAddress(extracted)) {
      return extracted
    }
  }
  
  // Fallback to regular address if it's valid
  if (address && isValidSolanaAddress(address)) {
    return address
  }
  
  return undefined
}
