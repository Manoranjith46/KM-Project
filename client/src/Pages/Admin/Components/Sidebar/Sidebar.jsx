import { useNavigate } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { useTheme } from '../../../../Context/ThemeContext'

export default function Sidebar({ currentPath }) {
  const navigate = useNavigate();



  const handleNavClick = ( path ) => {
    navigate(`/admin/${path}`);
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

      <button className={styles.themeToggle} onClick={toggleTheme}>
        <span className={styles.themeToggleIcon}>{isDarkMode ? '☀️' : '🌙'}</span>
        <span className={styles.themeToggleText}>{isDarkMode ? 'Light' : 'Dark'}</span>
      </button>
    </aside>
  )
}
