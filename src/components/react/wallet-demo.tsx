import { useState, useEffect } from 'react'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSolanaBalance } from '@/hooks/useSolanaBalance'
import { usePiuBalance } from '@/hooks/usePiuBalance'
import { getWalletAddress, formatAddress as formatSolanaAddress } from '@/utils/solana'
import { openAppKitModal } from '@/utils/appkit'

export function WalletDemo() {
  const { address, isConnected, caipAddress } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Initialize wallet manager
  useEffect(() => {
    const initWallet = () => {
      const manager = (window as any).walletManager;
      if (manager) {
        manager.onReady(() => {
          // AppKit is ready, no need to store the instance
        });
      } else {
        // Retry if manager not ready yet
        setTimeout(initWallet, 100);
      }
    };
    
    initWallet();
    // Mark as hydrated
    setIsHydrated(true);
  }, [])

  // Extract the actual wallet address
  const walletAddress = getWalletAddress(address, caipAddress)
  
  const { balance: solBalance, isLoading: solLoading } = useSolanaBalance(walletAddress)
  const { balance: piuBalance, isLoading: piuLoading } = usePiuBalance(walletAddress)

  const handleConnect = async () => {
    await openAppKitModal()
  }

  const handleDisconnect = async () => {
    await openAppKitModal()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Wallet Connection</CardTitle>
            <CardDescription>Connect your Solana wallet to interact with the dApp</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-secondary">Wallet Information</CardTitle>
            <CardDescription>Details about your connected wallet and PIU token balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Wallet Connection</CardTitle>
          <CardDescription>
            Connect your Solana wallet to interact with the dApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <Button 
              onClick={handleConnect}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Address</span>
                <div className="text-right">
                  <div className="text-sm font-mono">{walletAddress && formatSolanaAddress(walletAddress)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => walletAddress && copyToClipboard(walletAddress)}
                  className="flex-1"
                >
                  Copy Address
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleDisconnect}
                  className="flex-1"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-secondary">Wallet Information</CardTitle>
          <CardDescription>
            Your wallet details and balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Connect your wallet to view information</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Network */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  {caipNetwork?.name || 'Solana Mainnet'}
                </Badge>
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <span className="text-sm font-medium">SOL Balance</span>
                <div className="p-3 bg-muted rounded-md">
                  {solLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    <span className="font-mono text-sm">
                      {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Failed to load'}
                    </span>
                  )}
                </div>
              </div>

              {/* PIU Token */}
              <div className="space-y-2">
                <span className="text-sm font-medium">PIU Balance</span>
                <div className="p-3 bg-muted rounded-md">
                  {piuLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="font-mono text-sm text-accent">
                      {piuBalance !== null ? `${piuBalance.toLocaleString()} PIU` : 'Failed to load'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => walletAddress && window.open(`https://solscan.io/account/${walletAddress}`, '_blank')}
                >
                  View on Solscan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WalletDemo
