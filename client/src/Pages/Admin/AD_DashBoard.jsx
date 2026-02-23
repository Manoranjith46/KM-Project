import styles from './AD_Dashboard.module.css'
import Sidebar from './Components/Navbar/Sidebar'

export default function Admin_Dashboard() {

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

      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1 className={styles.pageTitle}>Owner Dashboard</h1>
            <p className={styles.pageSubtitle}>Welcome back, Admin</p>
          </div>

          <div className={styles.topBarCenter}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Search residents, rooms, payments..." 
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.topBarRight}>
            <button className={styles.notificationBtn}>
              <span className={styles.notificationIcon}>🔔</span>
              <span className={styles.badge}>3</span>
            </button>
            <div className={styles.profileCircle}>
              <span>A</span>
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
              {stat.progress && (
                <div className={styles.progressRing}>
                  <svg className={styles.progressSvg} viewBox="0 0 120 120">
                    <circle 
                      className={styles.progressBg} 
                      cx="60" 
                      cy="60" 
                      r="54"
                    />
                    <circle 
                      className={styles.progressFill} 
                      cx="60" 
                      cy="60" 
                      r="54"
                      style={{ strokeDashoffset: 339.292 - (339.292 * stat.progress) / 100 }}
                    />
                  </svg>
                  <div className={styles.progressText}>{stat.progress}%</div>
                </div>
              )}
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

          <div className={styles.tableContainer}>
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
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <a href="#" className={`${styles.bottomNavItem} ${styles.active}`}>
          <span className={styles.bottomNavIcon}>📊</span>
          <span className={styles.bottomNavLabel}>Dashboard</span>
        </a>
        <a href="#" className={styles.bottomNavItem}>
          <span className={styles.bottomNavIcon}>👥</span>
          <span className={styles.bottomNavLabel}>Residents</span>
        </a>
        <a href="#" className={styles.bottomNavItem}>
          <span className={styles.bottomNavIcon}>💳</span>
          <span className={styles.bottomNavLabel}>Payments</span>
        </a>
        <a href="#" className={styles.bottomNavItem}>
          <span className={styles.bottomNavIcon}>⚙️</span>
          <span className={styles.bottomNavLabel}>More</span>
        </a>
      </nav>
    </div>
  )
}
