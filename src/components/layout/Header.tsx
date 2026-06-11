import { VoksLogo } from '@/components/layout/VoksLogo'
import { InstallAppButton } from '@/components/pwa/InstallAppButton'

export function Header() {
  return (
    <header className="mb-8 flex flex-col items-center gap-4 text-center">
      <VoksLogo />
      <p className="text-sm font-medium tracking-wide text-secondary uppercase">
        Voks Digital Platform
      </p>
      <InstallAppButton />
    </header>
  )
}
