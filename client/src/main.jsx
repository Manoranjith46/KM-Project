import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './Context/ThemeContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

function setAppViewportHeight() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
}

setAppViewportHeight();
window.addEventListener('resize', setAppViewportHeight, { passive: true });
window.visualViewport?.addEventListener('resize', setAppViewportHeight, { passive: true });
window.visualViewport?.addEventListener('scroll', setAppViewportHeight, { passive: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
