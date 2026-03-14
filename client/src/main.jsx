import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './Context/ThemeContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

function setAppViewportHeight() {
  const vv = window.visualViewport;
  const viewportHeight = vv ? vv.height : window.innerHeight;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  // On mobile, use the smaller of visual viewport and innerHeight so we never
  // assume more than the visible area (avoids content hidden under URL bar).
  const heightPx = isMobile
    ? Math.min(viewportHeight, window.innerHeight)
    : viewportHeight;
  document.documentElement.style.setProperty('--app-height', `${heightPx}px`);
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
