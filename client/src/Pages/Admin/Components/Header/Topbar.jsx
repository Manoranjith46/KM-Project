import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../Context/AuthContext'
import { useTheme } from '../../../../Context/ThemeContext'
import styles from './Topbar.module.css'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export default function Topbar({ 
  title = 'Dashboard', 
  subtitle = 'Welcome back',
  currentView = 'dashboard',
  searchValue = '',
  onSearchChange = () => {},
  username = 'Admin',
  onMenuClick
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const showSearchBar = ['resident', 'payment', 'maintenance'].includes(currentView);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.topBar}>
      <div className={styles.topBarLeft}>
        {onMenuClick && (
          <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
        </div>
      </div>
      
      {showSearchBar && (
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search..."
            defaultValue={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className={styles.topBarRight}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {username.charAt(0).toUpperCase()}
          </div>
          <span className={styles.username}>{username}</span>
        </div>
        <button className={styles.themeToggleBtn} onClick={toggleTheme} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

    </header>
  )
}
