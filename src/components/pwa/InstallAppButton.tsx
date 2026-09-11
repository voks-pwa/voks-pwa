import { useState } from 'react'
import { Download, Share, Smartphone, X } from 'lucide-react'

import { usePWAInstall } from '@/hooks/use-pwa-install'

const HINT_DISMISS_KEY = 'voks:install-hint-dismissed'

export function InstallAppButton() {
  const { isInstallable, isInstalled, isStandalone, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(() =>
    typeof localStorage === 'undefined'
      ? false
      : localStorage.getItem(HINT_DISMISS_KEY) === '1',
  )

  if (isInstalled || isStandalone) {
    return null
  }

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)

  const dismissHint = () => {
    setDismissed(true)
    try {
      localStorage.setItem(HINT_DISMISS_KEY, '1')
    } catch {
      /* storage unavailable */
    }
  }

  if (isIOS && !dismissed) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-[#bda752]/25 bg-white p-4 shadow-sm">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5B5B3F] to-[#bda752]"
        />

        <button
          type="button"
          onClick={dismissHint}
          aria-label="Tutup"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B5B3F] to-[#bda752] text-white shadow-sm">
            <Smartphone size={18} />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">Install Voks di iPhone</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Buka <Share size={12} className="-mt-0.5 inline text-[#bda752]" />{' '}
              <span className="font-semibold text-gray-700">Share</span>, lalu pilih{' '}
              <span className="font-semibold text-gray-700">Add to Home Screen</span>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isInstallable) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B5B3F] to-[#bda752] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-105 active:scale-[0.98]"
    >
      <Download size={16} />
      Install App
    </button>
  )
}
