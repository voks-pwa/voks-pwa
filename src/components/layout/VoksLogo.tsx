import logoHorizontal from '@/assets/branding/logo-horizontal.png'
import logoSquare from '@/assets/branding/logo-square.png'

export function VoksLogo() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-primary/10 bg-background/80 p-3 shadow-sm sm:p-2">
      <img
        src={logoSquare}
        alt="Voks logo"
        className="block h-14 w-14 rounded-xl sm:hidden"
        loading="eager"
      />
      <img
        src={logoHorizontal}
        alt="Voks logo"
        className="hidden h-14 w-auto rounded-xl sm:block"
        loading="eager"
      />
    </div>
  )
}
