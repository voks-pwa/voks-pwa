import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PersistentAudioPlayer } from '@/components/player/PersistentAudioPlayer'
import { HomePage } from '@/pages/HomePage'
import { ProgramsPage } from '@/pages/ProgramsPage'
import { ProgramDetailPage } from '@/pages/ProgramDetailPage'
import { AnnouncersPage } from '@/pages/AnnouncersPage'
import { AnnouncerDetailPage } from '@/pages/AnnouncerDetailPage'
import { SchedulePage } from '@/pages/SchedulePage'
import { LiveStudioPage } from '@/pages/LiveStudioPage'

function App() {
  return (
    <BrowserRouter>

      <PersistentAudioPlayer />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/programs"
          element={<ProgramsPage />}
        />

        <Route
          path="/programs/:slug"
          element={<ProgramDetailPage />}
        />

        <Route
          path="/announcers"
          element={<AnnouncersPage />}
        />

        <Route
          path="/announcers/:slug"
          element={<AnnouncerDetailPage />}
        />

        <Route
          path="/schedule"
          element={<SchedulePage />}
        />
        <Route
          path="/live"
          element={<LiveStudioPage />}
        />
      </Routes>

    </BrowserRouter>
  )
}

export default App