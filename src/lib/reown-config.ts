import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { REOWN_PROJECT_ID } from './constants'
import { solana } from "@reown/appkit/networks";

// Solana adapter configuration - simplified without specific wallet adapters
const solanaAdapter = new SolanaAdapter()

// Create the AppKit instance
export const appKit = createAppKit({
  adapters: [solanaAdapter],
  projectId: REOWN_PROJECT_ID,
  networks: [solana],
  metadata: {
    name: 'PIU dApp',
    description: 'PIU Decentralized Application',
    url: 'https://app.piupiu.meme',
    icons: ['https://app.piupiu.meme/favicon.ico']
  },
  defaultNetwork: solana,
  enableNetworkSwitch: false,
  features: {
    email: false,
    socials: [],
    analytics: true,
  }
})

export { solanaAdapter }
