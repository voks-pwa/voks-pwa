import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PersistentAudioPlayer } from '@/components/player/PersistentAudioPlayer'
import { HomePage } from '@/pages/HomePage'
import { ProgramsPage } from '@/pages/ProgramsPage'
import { ProgramDetailPage } from '@/pages/ProgramDetailPage'
import { AnnouncersPage } from '@/pages/AnnouncersPage'
import { AnnouncerDetailPage } from '@/pages/AnnouncerDetailPage'
import { SchedulePage } from '@/pages/SchedulePage'
import { LiveStudioPage } from '@/pages/LiveStudioPage'
import { VoksPlusPage } from '@/pages/VoksPlusPage'
import { VoksPlusDetailPage } from '@/pages/VoksPlusDetailPage'
import { MorePage } from '@/pages/MorePage'
import { SearchPage } from '@/pages/SearchPage'
import {  NotificationsPage,} from '@/pages/NotificationsPage'
import { NotificationDetailPage } from '@/pages/NotificationDetailPage'

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
        <Route
          path="/more"
          element={<MorePage />}
        />

        <Route
           path="/plus"
           element={<VoksPlusPage />}
        />

        <Route
            path="/plus/:slug"
            element={<VoksPlusDetailPage />}
        />

        <Route
          path="/search"
         element={<SearchPage />}
        />
        <Route
          path="/notifications"
          element={<NotificationsPage />}
        />
        <Route
          path="/notifications/:id"
          element={<NotificationDetailPage />}
        />
      </Routes>

    </BrowserRouter>
  )
}

export default App