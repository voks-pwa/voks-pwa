import React from 'react'
import ReactDOM from 'react-dom/client'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import App from './App'
import '@/index.css'

import {
  AuthProvider,
} from '@/features/auth/AuthProvider'

/*
  IMPORTANT

  Execute Mission Runtime once
  so debug helper is attached
  to window.
*/
import '@/features/missions/missionRuntime'

const queryClient = new QueryClient()

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