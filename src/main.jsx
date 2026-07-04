import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Registered eagerly (doesn't require notification permission) so it's
// ready by the time a user grants push permission in ProfileScreen. Was
// previously never registered at all, so the push handlers in public/sw.js
// never ran regardless of permission state.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
