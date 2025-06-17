import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
// import { Workbox } from 'workbox-window'
import { registerSW } from 'virtual:pwa-register'

// if ('serviceWorker' in navigator) { 
//   const wb = new Workbox('/sw.js')
//   wb.register()
// }
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
