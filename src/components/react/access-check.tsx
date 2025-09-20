import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePiuBalance } from '@/hooks/usePiuBalance'
import { getWalletAddress } from '@/utils/solana'
import { openAppKitModal } from '@/utils/appkit'

interface AccessCheckProps {
  onAccessChange?: (hasAccess: boolean) => void
}

export function AccessCheck({ onAccessChange }: AccessCheckProps) {
  const { address, isConnected, caipAddress } = useAppKitAccount()
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
        setTimeout(initWallet, 100);
      }
    };
    initWallet();
    // Mark as hydrated
    setIsHydrated(true);
  }, [])
  
  const walletAddress = getWalletAddress(address, caipAddress)
  const { balance: piuBalance, isLoading: piuLoading } = usePiuBalance(walletAddress)

  // Dispatch access status
  useEffect(() => {
    const hasAccess = isConnected && piuBalance !== null && piuBalance > 0
    onAccessChange?.(hasAccess)
    
    const event = new CustomEvent('accessChange', {
      detail: { hasAccess }
    })
    window.dispatchEvent(event)
  }, [isConnected, piuBalance, onAccessChange])

  const handleConnect = async () => {
    await openAppKitModal()
  }

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Access Verification</CardTitle>
          <CardDescription className="text-center">Loading wallet connection...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-muted text-muted-foreground">Loading...</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determine status
  let badge, message, showButton = false
  
  if (!isConnected) {
    badge = <Badge variant="outline" className="bg-muted text-muted-foreground">Not connected</Badge>
    message = "Connect your wallet to access the content generator"
    showButton = true
  } else if (piuLoading) {
    badge = <Badge variant="outline" className="bg-muted text-muted-foreground">Loading...</Badge>
    message = "Checking PIU token balance..."
  } else if (piuBalance === null || piuBalance === 0) {
    badge = <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">No PIU tokens</Badge>
    message = "You need PIU tokens to access the content generator"
  } else {
    badge = <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Access granted</Badge>
    message = `Access granted - ${piuBalance.toLocaleString()} PIU tokens detected`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Access Verification</CardTitle>
        <CardDescription className="text-center">{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showButton && (
          <Button 
            onClick={handleConnect}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Connect Wallet
          </Button>
        )}
        <div className="text-center">{badge}</div>
      </CardContent>
    </Card>
  )
}

export default AccessCheck
