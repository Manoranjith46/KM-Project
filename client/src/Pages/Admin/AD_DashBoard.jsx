import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AD_Dashboard.module.css'
import Sidebar from './Components/Sidebar/Sidebar'
import Topbar from './Components/Header/Topbar'
import { DashboardSkeleton } from './Components/Skeleton/Skeleton'
import API from '../../API/axios'

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

/* ── Mobile Resident Card ── */
function OccupantCard({ r, navigate }) {
  return (
    <div className={styles.residentCard}>
      <div className={styles.residentCardHeader}>
        <div className={styles.residentCardAvatar}>{getInitials(r.name)}</div>
        <div className={styles.residentCardName}>{r.name}</div>
        <span className={`${styles.residentCardStatus} ${styles[r.type === 'Guest' ? 'pending' : 'paid']}`}>
          {r.type === 'Guest' ? '👤 Guest' : '🏠 Resident'}
        </span>
      </div>
      <div className={styles.residentCardBody}>
        <div className={styles.residentCardRow}>
          <span className={styles.residentCardLabel}>Room</span>
          <span className={`${styles.residentCardValue} ${styles.room}`}>{r.roomNumber}</span>
        </div>
        <div className={styles.residentCardRow}>
          <span className={styles.residentCardLabel}>Phone</span>
          <span className={styles.residentCardValue}>{r.phoneNumber}</span>
        </div>
        <div className={styles.residentCardRow}>
          <span className={styles.residentCardLabel}>Joined</span>
          <span className={`${styles.residentCardValue} ${styles.date}`}>{formatDate(r.joiningDate)}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile Payment Card ── */
function PaymentCard({ p }) {
  return (
    <div className={styles.residentCard}>
      <div className={styles.residentCardHeader}>
        <div className={styles.residentCardAvatar}>{getInitials(p.name)}</div>
        <div className={styles.residentCardName}>{p.name}</div>
        <span className={`${styles.statusBadge} ${styles.paid}`}>✓ Paid</span>
      </div>
      <div className={styles.residentCardBody}>
        <div className={styles.residentCardRow}>
          <span className={styles.residentCardLabel}>Room</span>
          <span className={`${styles.residentCardValue} ${styles.room}`}>{p.roomNumber}</span>
        </div>
        <div className={styles.residentCardRow}>
          <span className={styles.residentCardLabel}>Amount</span>
          <span className={`${styles.residentCardValue} ${styles.amount}`}>{formatCurrency(p.amount)}</span>
        </div>
        <div className={styles.residentCardRow}>
          <span className={styles.residentCardLabel}>Date</span>
          <span className={`${styles.residentCardValue} ${styles.date}`}>{formatDate(p.date)}</span>
        </div>
        <div className={styles.residentCardRow}>
          <span className={styles.residentCardLabel}>Method</span>
          <span className={styles.residentCardValue}>{p.paymentMethod}</span>
        </div>
      </div>
    </div>
  )
}

export default function Admin_Dashboard() {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Dashboard data from API
  const [occupancy, setOccupancy] = useState({ filled: 0, total: 0, percent: 0 })
  const [revenue, setRevenue] = useState(0)
  const [pendingPayments, setPendingPayments] = useState(0)
  const [complaints, setComplaints] = useState({ open: 0, pending: 0, inProgress: 0 })
  const [meals, setMeals] = useState([])
  const [totalActive, setTotalActive] = useState(0)
  const [recentActivity, setRecentActivity] = useState([])
  const [recentOccupants, setRecentOccupants] = useState([])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setIsSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false)
    }
    if (isSidebarOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isSidebarOpen])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const { data } = await API.get('/admin/dashboard')
        setOccupancy(data.occupancy)
        setRevenue(data.revenue)
        setPendingPayments(data.pendingPayments)
        setComplaints(data.complaints)
        setMeals(data.meals)
        setTotalActive(data.totalActive)
        setRecentActivity(data.recentActivity)
        setRecentOccupants(data.recentOccupants)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleBackdropClick = () => setIsSidebarOpen(false)

  const statsData = [
    {
      title: 'Occupancy',
      value: `${occupancy.filled}/${occupancy.total}`,
      subtitle: 'Beds Filled',
      icon: '🏠',
      trend: `${occupancy.percent}% occupied`,
    },
    {
      title: 'Revenue',
      value: formatCurrency(revenue),
      subtitle: 'This Month',
      icon: '💰',
      trend: 'Approved payments',
    },
    {
      title: 'Pending Payments',
      value: String(pendingPayments),
      subtitle: 'Residents',
      icon: '⏳',
      trend: pendingPayments > 0 ? `${pendingPayments} awaiting` : 'All clear',
    },
    {
      title: 'Open Complaints',
      value: String(complaints.open),
      subtitle: 'Tickets',
      icon: '🎫',
      trend: complaints.pending > 0 ? `${complaints.pending} pending` : 'None pending',
    },
  ]

  return (
    <div className={`${styles.dashboardWrapper}`}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} currentPath={'dashboard'} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Bar */}
        <Topbar 
          title="Owner Dashboard" 
          subtitle="Welcome back, Admin"
          currentView="dashboard"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {isLoading ? <DashboardSkeleton /> : (
        <>
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
              </div>
            ))}
          </section>

          {/* Kitchen/Food Module */}
          <section className={styles.kitchenModule}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Today's Menu</h2>
              <button className={styles.sectionAction} onClick={() => navigate('/admin/kitchen')}>View Kitchen</button>
            </div>

            <div className={styles.mealGrid}>
              {meals.map((meal, index) => (
                <div key={index} className={`${styles.mealCard} ${styles[meal.color]}`}>
                  <div className={styles.mealHeader}>
                    <h3 className={styles.mealType}>{meal.type}</h3>
                    <span className={styles.mealTime}>{meal.time || 'Not set'}</span>
                  </div>
                  {meal.items.length > 0 ? (
                    <ul className={styles.menuList}>
                      {meal.items.map((item, i) => (
                        <li key={i} className={styles.menuItem}>
                          <span className={styles.menuDot} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noMenu}>No menu set</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Recent Payment Activity */}
          <section className={styles.residentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Payment Activity</h2>
              <button className={styles.sectionAction} onClick={() => navigate('/admin/payments')}>View All</button>
            </div>

            {recentActivity.length === 0 ? (
              <div className={styles.emptyState}>No recent payments found.</div>
            ) : (
            <>
              {/* Desktop Table View */}
              <div className={styles.tableContainer} style={isMobile ? { display: 'none' } : {}}>
                <table className={styles.residentTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Room</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className={styles.residentInfo}>
                            <div className={styles.residentAvatar}>{getInitials(p.name)}</div>
                            <span className={styles.residentName}>{p.name}</span>
                          </div>
                        </td>
                        <td className={styles.roomNumber}>{p.roomNumber}</td>
                        <td className={styles.amount}>{formatCurrency(p.amount)}</td>
                        <td className={styles.date}>{formatDate(p.date)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles.paid}`}>
                            {p.paymentMethod}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className={`${styles.residentCardsView} ${isMobile ? styles.visible : ''}`}>
                {recentActivity.map((p) => (
                  <PaymentCard key={p._id} p={p} />
                ))}
              </div>
            </>
            )}
          </section>

        </>
        )}
      </main>

    </div>
  )
}