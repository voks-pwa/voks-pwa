import { usePWAInstall } from '@/hooks/use-pwa-install'

export function InstallAppButton() {
  const { isInstallable, isInstalled, isStandalone, install } = usePWAInstall()

  if (isInstalled || isStandalone) {
    return null
  }

  if (!isInstallable) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-primary/20 active:bg-primary/25"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Install App
    </button>
  )
}
