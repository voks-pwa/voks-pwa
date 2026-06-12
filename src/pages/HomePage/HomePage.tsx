import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { AudioPlayerCard } from '@/components/player/AudioPlayerCard'
import { CurrentShowCard } from '@/components/programs/CurrentShowCard'

export function HomePage() {
  return (
    <AppLayout>
      <Header />
      <div className="flex w-full flex-col gap-6">
        <CurrentShowCard />
        <AudioPlayerCard />
      </div>
    </AppLayout>
  )
}
