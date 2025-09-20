import { PublicKey } from '@solana/web3.js'

// Reown AppKit Configuration
export const REOWN_PROJECT_ID = import.meta.env.PUBLIC_REOWN_PROJECT_ID

// Solana Configuration
export const SOLANA_RPC_URL = import.meta.env.PUBLIC_SOLANA_RPC_URL

// PIU Token Configuration
export const PIU_TOKEN_MINT_ADDRESS = '5eafqp6ic7WpxUsKJLhnLxthUcEYatjhXPNLBRZCpump'
export const PIU_TOKEN_MINT = new PublicKey(PIU_TOKEN_MINT_ADDRESS)
