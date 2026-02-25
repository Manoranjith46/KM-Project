import { useState, useEffect } from 'react'
import styles from './AD_Dashboard.module.css'
import Sidebar from './Components/Sidebar/Sidebar'

export default function Admin_Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile on mount and resize (678px breakpoint)
    const checkMobile = () => {
      const mobile = window.innerWidth <= 678
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    if (isSidebarOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isSidebarOpen])

  const handleBackdropClick = () => {
    setIsSidebarOpen(false)
  }

  const statsData = [
    {
      title: 'Occupancy',
      value: '42/50',
      subtitle: 'Beds Filled',
      progress: 84,
      icon: '🏠',
      trend: '+5% this month'
    },
    {
      title: 'Revenue',
      value: '₹2,45,000',
      subtitle: 'This Month',
      icon: '💰',
      trend: '+12% vs last month',
      sparkline: true
    },
    {
      title: 'Pending Payments',
      value: '8',
      subtitle: 'Residents',
      icon: '⏳',
      trend: '2 overdue'
    },
    {
      title: 'Complaints',
      value: '3',
      subtitle: 'Open Tickets',
      icon: '🎫',
      trend: '5 resolved today'
    }
  ]

  const mealData = [
    { type: 'Breakfast', count: 42, time: '7:00 AM - 9:00 AM', color: 'breakfast' },
    { type: 'Lunch', count: 45, time: '12:00 PM - 2:00 PM', color: 'lunch' },
    { type: 'Dinner', count: 48, time: '7:00 PM - 9:00 PM', color: 'dinner' }
  ]

  const residentsData = [
    { id: 1, name: 'Rahul Sharma', room: '101', status: 'paid', amount: '₹8,500', date: '01 Feb' },
    { id: 2, name: 'Priya Patel', room: '205', status: 'pending', amount: '₹8,500', date: 'Due' },
    { id: 3, name: 'Amit Kumar', room: '312', status: 'paid', amount: '₹8,500', date: '28 Jan' },
    { id: 4, name: 'Sneha Reddy', room: '108', status: 'paid', amount: '₹8,500', date: '30 Jan' },
    { id: 5, name: 'Vikram Singh', room: '204', status: 'overdue', amount: '₹8,500', date: '15 Jan' },
    { id: 6, name: 'Anjali Verma', room: '301', status: 'paid', amount: '₹8,500', date: '02 Feb' }
  ]

  return (
    <div className={styles.dashboardWrapper}>
      {/* Floating Background Blobs */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && isMobile && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={handleBackdropClick}
          role="presentation"
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} currentPath={'dashboard'} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Owner Dashboard</h1>
              <p className={styles.pageSubtitle}>Welcome back, Admin</p>
            </div>
          </div>
        </header>

        {/* Hero Stats Grid */}
        <section className={styles.heroStats}>
          {statsData.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon}>{stat.icon}</span>
                <span className={styles.statTrend}>{stat.trend}</span>
              </div>
              <div className={styles.statBody}>
                <h3 className={styles.statValue}>{stat.value}</h3>
                <p className={styles.statTitle}>{stat.title}</p>
                <p className={styles.statSubtitle}>{stat.subtitle}</p>
              </div>
              {stat.sparkline && (
                <div className={styles.sparkline}>
                  <svg viewBox="0 0 100 30" className={styles.sparklineSvg}>
                    <polyline
                      points="0,25 20,20 40,22 60,15 80,18 100,10"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Kitchen/Food Module */}
        <section className={styles.kitchenModule}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Today's Meal Service</h2>
            <button className={styles.sectionAction}>View Details</button>
          </div>

          <div className={styles.mealGrid}>
            {mealData.map((meal, index) => (
              <div key={index} className={`${styles.mealCard} ${styles[meal.color]}`}>
                <div className={styles.mealHeader}>
                  <h3 className={styles.mealType}>{meal.type}</h3>
                  <span className={styles.mealTime}>{meal.time}</span>
                </div>
                <div className={styles.mealCount}>
                  <span className={styles.countNumber}>{meal.count}</span>
                  <span className={styles.countLabel}>Servings</span>
                </div>
                <div className={styles.mealProgress}>
                  <div 
                    className={styles.mealProgressBar}
                    style={{ width: `${(meal.count / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resident List Preview */}
        <section className={styles.residentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Payment Activity</h2>
            <button className={styles.sectionAction}>View All</button>
          </div>

          {/* Desktop Table View */}
          <div className={styles.tableContainer} style={isMobile ? { display: 'none' } : {}}>
            <table className={styles.residentTable}>
              <thead>
                <tr>
                  <th>Resident Name</th>
                  <th>Room No</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {residentsData.map((resident) => (
                  <tr key={resident.id}>
                    <td>
                      <div className={styles.residentInfo}>
                        <div className={styles.residentAvatar}>
                          {resident.name.charAt(0)}
                        </div>
                        <span className={styles.residentName}>{resident.name}</span>
                      </div>
                    </td>
                    <td className={styles.roomNumber}>{resident.room}</td>
                    <td className={styles.amount}>{resident.amount}</td>
                    <td className={styles.date}>{resident.date}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[resident.status]}`}>
                        {resident.status === 'paid' ? '✓ Paid' : 
                         resident.status === 'pending' ? '⏳ Pending' : 
                         '⚠ Overdue'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={`${styles.residentCardsView} ${isMobile ? styles.visible : ''}`}>
            {residentsData.map((resident) => (
              <div key={resident.id} className={styles.residentCard}>
                <div className={styles.residentCardHeader}>
                  <div className={styles.residentCardAvatar}>
                    {resident.name.charAt(0)}
                  </div>
                  <div className={styles.residentCardName}>
                    {resident.name}
                  </div>
                  <span className={`${styles.residentCardStatus} ${styles[resident.status]}`}>
                    {resident.status === 'paid' ? '✓ Paid' : 
                     resident.status === 'pending' ? '⏳ Pending' : 
                     '⚠ Overdue'}
                  </span>
                </div>
                <div className={styles.residentCardBody}>
                  <div className={styles.residentCardRow}>
                    <span className={styles.residentCardLabel}>Room</span>
                    <span className={`${styles.residentCardValue} ${styles.room}`}>{resident.room}</span>
                  </div>
                  <div className={styles.residentCardRow}>
                    <span className={styles.residentCardLabel}>Amount</span>
                    <span className={`${styles.residentCardValue} ${styles.amount}`}>{resident.amount}</span>
                  </div>
                  <div className={styles.residentCardRow}>
                    <span className={styles.residentCardLabel}>Date</span>
                    <span className={`${styles.residentCardValue} ${styles.date}`}>{resident.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button className={`${styles.bottomNavItem} ${styles.active}`} title="Dashboard">
          <span className={styles.bottomNavIcon}>📊</span>
          <span className={styles.bottomNavLabel}>Dashboard</span>
        </button>
        <button className={styles.bottomNavItem} title="Residents">
          <span className={styles.bottomNavIcon}>👥</span>
          <span className={styles.bottomNavLabel}>Residents</span>
        </button>
        <button className={styles.bottomNavItem} title="Payments">
          <span className={styles.bottomNavIcon}>💳</span>
          <span className={styles.bottomNavLabel}>Payments</span>
        </button>
        <button className={styles.bottomNavItem} title="More">
          <span className={styles.bottomNavIcon}>⚙️</span>
          <span className={styles.bottomNavLabel}>More</span>
        </button>
      </nav>
    </div>
  )
}
