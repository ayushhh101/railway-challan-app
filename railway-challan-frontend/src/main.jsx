import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
// import { Workbox } from 'workbox-window'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() { /* optionally prompt user to update */ },
  onOfflineReady() { /* notify user app is ready offline */ }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
  </StrictMode>,
)
