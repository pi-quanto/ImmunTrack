import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './AuthProvider/AuthContext.jsx'
import { ThemeProvider } from './components/ThemeContext'
import App from './App.jsx'

// main.jsx is the entry point — it mounts the React app onto the <div id="root"> in index.html
// StrictMode runs extra checks in development (highlights potential problems) but has no effect in production

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
