import styles from './Sidebar.module.css'
import { useTheme } from '../../../../Context/ThemeContext'

export default function Sidebar() {
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
        <a href="#" className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navText}>Dashboard</span>
        </a>
        <a href="#" className={styles.navItem}>
          <span className={styles.navIcon}>👥</span>
          <span className={styles.navText}>Residents</span>
        </a>
        <a href="#" className={styles.navItem}>
          <span className={styles.navIcon}>🍽️</span>
          <span className={styles.navText}>Kitchen</span>
        </a>
        <a href="#" className={styles.navItem}>
          <span className={styles.navIcon}>💳</span>
          <span className={styles.navText}>Payments</span>
        </a>
        <a href="#" className={styles.navItem}>
          <span className={styles.navIcon}>🔧</span>
          <span className={styles.navText}>Maintenance</span>
        </a>
        <a href="#" className={styles.navItem}>
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
