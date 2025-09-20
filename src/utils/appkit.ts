/**
 * Utility to get AppKit instance from various sources
 */
export async function getAppKitInstance(): Promise<any | null> {
  // Try to get from window.walletManager first
  if ((window as any).walletManager?.appKit) {
    return (window as any).walletManager.appKit
  }
  
  // Fallback to direct import if walletManager is not ready
  try {
    const { appKit } = await import('../lib/reown-config')
    return appKit
  } catch (error) {
    console.error('Failed to get AppKit instance:', error)
    return null
  }
}

/**
 * Open AppKit modal with fallback mechanisms
 */
export async function openAppKitModal(): Promise<void> {
  const appKit = await getAppKitInstance()
  if (appKit) {
    appKit.open()
    // Force refresh after modal opens
    setTimeout(() => {
      forceWalletRefresh()
    }, 500)
  } else {
    console.warn('AppKit not available')
  }
}

/**
 * Force refresh of all wallet-related components by dispatching custom events
 */
export function forceWalletRefresh(): void {
  window.dispatchEvent(new CustomEvent('walletStateChanged'))
}
