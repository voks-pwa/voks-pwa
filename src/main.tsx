import React from 'react'
import ReactDOM from 'react-dom/client'

import {
  QueryClientProvider,
} from '@tanstack/react-query'

import App from './App'
import '@/index.css'

import {
  AuthProvider,
} from '@/features/auth/AuthProvider'

import { queryClient } from '@/lib/query-client'

/*
  IMPORTANT

  Execute Mission Runtime once
  so debug helper is attached
  to window.
*/
import '@/features/missions/services/missionRuntime'

/*
  In dev, a service worker left over from a previous `build`/`preview` keeps
  intercepting cross-origin WP/Supabase requests and failing with `no-response`,
  which the browser reports as misleading CORS errors. Unregister + clear caches
  so dev always talks to the network directly.
*/
if (import.meta.env.DEV && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) void registration.unregister()
  })
  if ('caches' in window) {
    void caches.keys().then((keys) => {
      for (const key of keys) void caches.delete(key)
    })
  }
}

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <QueryClientProvider
      client={queryClient}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)