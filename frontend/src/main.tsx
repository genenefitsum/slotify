import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

const MaybeGoogleProvider = ({ children }: { children: ReactNode }) => {
  if (!googleClientId) {
    return <>{children}</>
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MaybeGoogleProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MaybeGoogleProvider>
  </StrictMode>,
)
