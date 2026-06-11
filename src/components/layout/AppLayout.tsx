import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-background text-text">
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 pb-8 pt-6 sm:px-6">
        {children}
      </main>
    </div>
  )
}
