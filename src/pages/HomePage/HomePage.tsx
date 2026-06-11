import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { AudioPlayerCard } from '@/components/player/AudioPlayerCard'

export function HomePage() {
  return (
    <AppLayout>
      <Header />
      <AudioPlayerCard />
    </AppLayout>
  )
}
