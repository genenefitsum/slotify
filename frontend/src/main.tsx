/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ui/error-boundary'
import { ToastProvider } from './components/ui/toast'
import { AuthProvider } from './contexts/AuthContext'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
const queryClient = new QueryClient()

const MaybeGoogleProvider = ({ children }: { children: ReactNode }) => {
  if (!googleClientId) {
    return <>{children}</>
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MaybeGoogleProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ToastProvider>
            <BrowserRouter>
              <AuthProvider>
                <App />
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </MaybeGoogleProvider>
  </StrictMode>,
)
