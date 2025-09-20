import { Connection } from '@solana/web3.js'

/**
 * Gets a cached Solana connection
 */
let cachedConnection: Connection | null = null

export async function getSolanaConnection(): Promise<Connection> {
  if (!cachedConnection) {
    // Use PublicNode - free and reliable public RPC
    const endpoint = 'https://solana-rpc.publicnode.com' // PublicNode - free and privacy-first
    cachedConnection = new Connection(endpoint, 'confirmed')
  }
  return cachedConnection
}
