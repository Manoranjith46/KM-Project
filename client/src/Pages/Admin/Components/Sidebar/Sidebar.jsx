import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../Context/AuthContext'
import styles from './Sidebar.module.css'
import { useTheme } from '../../../../Context/ThemeContext'

export default function Sidebar({ currentPath }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavClick = ( path ) => {
    navigate(`/admin/${path}`);
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  }

  const { isDarkMode, toggleTheme } = useTheme()
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🏢</span>
          <span className={styles.logoText}>PG-Ease</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <a href="#" className={`${styles.navItem} ${currentPath === 'dashboard' ? styles.active : ''}`} onClick={() => { handleNavClick('dashboard') }} >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navText}>Dashboard</span>
        </a>
        <a href="#" className={`${styles.navItem} ${currentPath === 'residents' ? styles.active : ''}`} onClick={() => { handleNavClick('residents') }} >
          <span className={styles.navIcon}>👥</span>
          <span className={styles.navText}>Residents</span>
        </a>
        <a href="#" className={`${styles.navItem} ${currentPath === 'kitchen' ? styles.active : ''}`} onClick={() => { handleNavClick('kitchen') }} >
          <span className={styles.navIcon}>🍽️</span>
          <span className={styles.navText}>Kitchen</span>
        </a>
        <a href="#" className={`${styles.navItem} ${currentPath === 'payments' ? styles.active : ''}`} onClick={() => { handleNavClick('payments') }} >
          <span className={styles.navIcon}>💳</span>
          <span className={styles.navText}>Payments</span>
        </a>
        <a href="#" className={`${styles.navItem} ${currentPath === 'maintenance' ? styles.active : ''}`} onClick={() => { handleNavClick('maintenance') }} >
          <span className={styles.navIcon}>🔧</span>
          <span className={styles.navText}>Maintenance</span>
        </a>
        <a href="#" className={`${styles.navItem} ${currentPath === 'settings' ? styles.active : ''}`} onClick={() => { handleNavClick('settings') }} >
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navText}>Settings</span>
        </a>
      </nav>
      <button className={styles.logoutBtn} onClick={handleLogout} disabled={isLoggingOut}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span className={styles.logoutText}>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
      </button>
    </aside>
  )
}

