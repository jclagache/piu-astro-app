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

  const handleConnect = async () => {
    await openAppKitModal()
  }

  const handleDisconnect = async () => {
    await openAppKitModal()
  }

  // Show loading state during hydration
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
      <Button
        variant="secondary"
        onClick={handleDisconnect}
      >
        <VscSignOut />{formatSolanaAddress(walletAddress)}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      variant="default">
      <VscSignIn /> Connect Wallet
    </Button>
  )
}

export default WalletConnectButton
