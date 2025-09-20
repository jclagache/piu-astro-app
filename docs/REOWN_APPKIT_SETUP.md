# Reown AppKit Setup Guide for Solana

## 📋 Overview

This guide details the installation and configuration of Reown AppKit for Solana wallet connections in the PIU dApp application.

## 🚀 Installation

### 1. Required packages

```bash
npm install @reown/appkit @reown/appkit-adapter-solana
npm install @solana/web3.js @solana/wallet-adapter-base
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets
```

### 2. UI Dependencies (already installed)

```bash
npm install @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
```

## 🔧 Configuration

### 1. Environment variables

Create a `.env.local` file with your Reown Project ID:

```env
PUBLIC_REOWN_PROJECT_ID=your_reown_project_id_here
PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 2. Constants configuration

File `src/lib/constants.ts`:

```typescript
import { PublicKey } from '@solana/web3.js'

// Reown AppKit Configuration
export const REOWN_PROJECT_ID = import.meta.env.PUBLIC_REOWN_PROJECT_ID

// Solana Configuration
export const SOLANA_RPC_URL = import.meta.env.PUBLIC_SOLANA_RPC_URL

// PIU Token Configuration
export const PIU_TOKEN_MINT_ADDRESS = '5eafqp6ic7WpxUsKJLhnLxthUcEYatjhXPNLBRZCpump'
export const PIU_TOKEN_MINT = new PublicKey(PIU_TOKEN_MINT_ADDRESS)
```

### 3. Reown AppKit configuration

File `src/lib/reown-config.ts`:

```typescript
import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { REOWN_PROJECT_ID } from './constants'
import { solana } from "@reown/appkit/networks";

// Solana adapter configuration
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
```

## 🎨 React Components

### 1. Wallet Provider

```typescript
// src/components/react/wallet-provider.tsx
import { useEffect, useState } from 'react'
import { appKit } from '@/lib/reown-config'

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return <div className="animate-spin">Loading...</div>
  }

  return <>{children}</>
}
```

### 2. Wallet Connect Button

```typescript
// src/components/react/wallet-connect-button.tsx
import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { getWalletAddress, formatAddress as formatSolanaAddress } from '@/utils/solana'
import { openAppKitModal } from '@/utils/appkit'
import { VscSignIn, VscSignOut } from 'react-icons/vsc'

export function WalletConnectButton() {
  const { address, isConnected, caipAddress } = useAppKitAccount()
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize wallet manager
  useEffect(() => {
    const initWallet = () => {
      const manager = (window as any).walletManager;
      if (manager) {
        manager.onReady(() => {
          // AppKit is ready
        });
      } else {
        setTimeout(initWallet, 100);
      }
    };

    initWallet();
    setIsHydrated(true);
  }, [])

  const walletAddress = getWalletAddress(address, caipAddress)

  const handleConnect = async () => {
    await openAppKitModal()
  }

  const handleDisconnect = async () => {
    await openAppKitModal()
  }

  if (!isHydrated) {
    return (
      <Button disabled className="bg-muted text-muted-foreground">
        <VscSignIn className="mr-2" />
        Loading...
      </Button>
    )
  }

  if (isConnected && walletAddress) {
    return (
      <Button variant="outline" onClick={handleDisconnect}>
        <VscSignOut />{formatSolanaAddress(walletAddress)}
      </Button>
    )
  }

  return (
    <Button onClick={handleConnect} className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <VscSignIn className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
```

## 🔧 Utility Functions

### 1. AppKit utilities

File `src/utils/appkit.ts`:

```typescript
import { appKit } from '@/lib/reown-config'

export async function openAppKitModal() {
  if (appKit) {
    await appKit.open()
  }
}

export function closeAppKitModal() {
  if (appKit) {
    appKit.close()
  }
}
```

### 2. Solana utilities

File `src/utils/solana.ts`:

```typescript
import { PublicKey } from '@solana/web3.js'

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function getWalletAddress(address: string | undefined, caipAddress: string | undefined): string | undefined {
  if (!address && !caipAddress) return undefined
  
  // Extract Solana address from CAIP format if needed
  if (caipAddress && caipAddress.startsWith('solana:')) {
    return caipAddress.replace('solana:', '')
  }
  
  return address || caipAddress
}
```

## 🎯 Usage in Astro Components

### 1. Layout integration

File `src/layouts/main.astro`:

```astro
---
import '../styles/global.css';
import WalletManager from '../components/WalletManager.astro';
import Navigation from '../components/Navigation.astro';
import Footer from '../components/Footer.astro';

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title || 'PIU dApp'}</title>
  </head>
  <body class="min-h-screen bg-background text-foreground flex flex-col">
    <WalletManager />
    <Navigation />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

### 2. Navigation with wallet button

File `src/components/Navigation.astro`:

```astro
---
import WalletConnectButton from './react/wallet-connect-button.tsx';
import { Button } from './ui/button';

const isDev = import.meta.env.DEV;
---

<nav class="border-b border-border bg-card">
  <div class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <a href="/" class="text-2xl font-bold text-primary">PIU dApp</a>
      <div class="flex items-center space-x-4">
        <Button variant="link"><a href="/">Home</a></Button>
        <Button variant="link"><a href="/wallet">Wallet</a></Button>
        <Button variant="link"><a href="/exclusive-holders-content">Exclusive Content</a></Button>
        <Button variant="link"><a href="/content-generator">Content Generator</a></Button>
        
        {isDev && (
          <>
            <div class="h-4 w-px bg-border mx-2"></div>
            <span class="text-xs text-muted-foreground font-medium">DEV:</span>
            <Button variant="link" size="sm"><a href="/dev/colors">Colors</a></Button>
            <Button variant="link" size="sm"><a href="/dev/demo">Demo</a></Button>
            <Button variant="link" size="sm"><a href="/dev/shadcn">Shadcn</a></Button>
            <Button variant="link" size="sm"><a href="/dev/markdown-page">Markdown</a></Button>
          </>
        )}
        
        <WalletConnectButton client:load />
      </div>
    </div>
  </div>
</nav>
```

## 🚀 Deployment

### Cloudflare Pages

The application is configured for deployment on Cloudflare Pages with SSR support:

1. **Build configuration**:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`

2. **Environment variables**:
   - `PUBLIC_REOWN_PROJECT_ID`: Your Reown Project ID
   - `PUBLIC_SOLANA_RPC_URL`: Solana RPC endpoint

3. **Astro configuration**:
   ```javascript
   // astro.config.mjs
   export default defineConfig({
     output: 'server',
     adapter: cloudflare({
       platformProxy: {
         enabled: true,
       },
     }),
     integrations: [react()]
   });
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Wallet not connecting**: Ensure `PUBLIC_REOWN_PROJECT_ID` is set correctly
2. **RPC errors**: Check `PUBLIC_SOLANA_RPC_URL` endpoint
3. **Hydration issues**: Use `client:load` directive for React components
4. **Build errors**: Ensure all dependencies are installed

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG=reown:*
```

## 📚 Additional Resources

- [Reown AppKit Documentation](https://docs.reown.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Astro React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)