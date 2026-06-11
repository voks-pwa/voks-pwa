import { useCallback, useEffect, useState } from 'react'
import type { BeforeInstallPromptEvent, PWAInstallState } from '@/types/pwa'

function getIsStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  )
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(getIsStandalone)

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const onDisplayModeChange = () => {
      setIsStandalone(getIsStandalone())
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    mediaQuery.addEventListener('change', onDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      mediaQuery.removeEventListener('change', onDisplayModeChange)
    }
  }, [])

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstalled(true)
      return true
    }

    return false
  }, [deferredPrompt])

  return {
    isInstallable: deferredPrompt !== null && !isInstalled && !isStandalone,
    isInstalled,
    isStandalone,
    install,
  }
}
