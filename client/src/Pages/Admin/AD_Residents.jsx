import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AD_Residents.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Topbar from "./Components/Header/Topbar";
import Popup from "./Components/Popup/Popup";

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function StatusPill({ status }) {
  const cls =
    status === "Paid"    ? styles.statusPaid :
    status === "Pending" ? styles.statusPending :
                           styles.statusOverdue;
  const icon =
    status === "Paid"    ? "✓" :
    status === "Pending" ? "⏳" : "⚠";
  return <span className={`${styles.statusPill} ${cls}`}>{icon} {status}</span>;
}

function KebabMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.kebabWrapper}>
      <button
        className={styles.kebabBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="Actions"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
      {open && (
        <div className={styles.kebabDropdown}>
          <button className={styles.kebabItem} onClick={() => setOpen(false)}>Edit</button>
          <button className={styles.kebabItem} onClick={() => setOpen(false)}>View</button>
          <button className={`${styles.kebabItem} ${styles.kebabDanger}`} onClick={() => setOpen(false)}>Remove</button>
        </div>
      )}
    </div>
  );
}

/* ── Mobile Resident Card ── */
function ResidentCard({ r }) {
  return (
    <div className={styles.residentCard}>
      <div className={styles.residentCardTop}>
        <div className={styles.residentCardLeft}>
          <div className={styles.initAvatar}>{getInitials(r.name)}</div>
          <div>
            <div className={styles.residentName}>{r.name}</div>
            <div className={styles.residentCardSub}>Room {r.room}</div>
          </div>
        </div>
        <div className={styles.residentCardRight}>
          <StatusPill status={r.status} />
        </div>
      </div>
      <div className={styles.residentCardMeta}>
        <div className={styles.residentCardMetaItem}>
          <span className={styles.residentCardMetaLabel}>Phone</span>
          <span className={styles.residentCardMetaValue}>{r.phone}</span>
        </div>
        <div className={styles.residentCardMetaItem}>
          <span className={styles.residentCardMetaLabel}>Joining Date</span>
          <span className={styles.residentCardMetaValue}>{r.moveIn}</span>
        </div>
      </div>
    </div>
  );
}

export default function AD_Residents() {

  const navigate = useNavigate();
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, type: '', title: '', message: '' });

  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("residents");
  const [roomNumberFilter, setRoomNumberFilter] = useState("All");
  const [statusFilter, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_API_URL}api/residents`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized');
          setResidents([]);
          setPopupConfig({
            isOpen: true,
            type: 'error',
            title: 'Access Denied',
            message: 'You do not have permission to view residents. Only owners can access this page.'
          });
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch residents. Status: ${response.status}`);
        }

        const data = await response.json();
        const normalizedResidents = (Array.isArray(data) ? data : []).map((resident, index) => ({
          id: resident._id || resident.id || index,
          name: resident.name || '',
          room: resident.roomNumber || '-',
          phone: resident.phoneNumber || '-',
          moveIn: resident.joiningDate ? new Date(resident.joiningDate).toLocaleDateString('en-GB') : '-',
          status: 'Active',
        }));

        setResidents(normalizedResidents);
      } catch (err) {
        const errorMsg = err.message || 'Something went wrong while fetching residents.';
        setError(errorMsg);
        setResidents([]);
        setPopupConfig({
          isOpen: true,
          type: 'error',
          title: 'Error Loading Residents',
          message: errorMsg
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResidents();
  }, []);

  // Filter and sort residents
  const filtered = residents
    .filter((r) => {
      const roomMatch = roomNumberFilter === "All" || r.room === roomNumberFilter;
      const statusMatch = statusFilter === "All" || r.status === statusFilter;
      return roomMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "room") {
        return a.room.toString().localeCompare(b.room.toString());
      }
      return 0;
    });

  return (
    <div className={styles.dashboardWrapper}>
      {/* Floating Background Blobs */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath={'residents'} />

      <main className={styles.mainContent}>

        <Topbar 
          title="Residents Directory"
          currentView="resident"
        />

        <div className={styles.content}>

          {/* Header Row */}
          <div className={styles.contentHeader}>
            <h2 className={styles.sectionTitle}>All Residents</h2>
            <button className={styles.addBtn} onClick={() => {navigate('/admin/residents/add')}} >+ Add Resident</button>
          </div>

          {isLoading && <div className={styles.emptyRow}>Loading residents...</div>}
          {error && <div className={styles.emptyRow}>{error}</div>}

          {/* Quick Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Active</span>
              <span className={styles.statValue}>{residents.length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Moving In</span>
              <span className={styles.statValue}>3</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>On Notice</span>
              <span className={styles.statValue}>5</span>
            </div>
          </div>

          {/* Filters & Sorting */}
          <div className={styles.filterRow}>
            <select className={styles.filterSelect} value={roomNumberFilter} onChange={(e) => setRoomNumberFilter(e.target.value)}>
              <option value="All">Room Number (All)</option>
              <option value="101">101</option>
              <option value="102">102</option>
              <option value="103">103</option>
              <option value="104">104</option>
              <option value="105">105</option>
              <option value="201">201</option>
              <option value="202">202</option>
              <option value="203">203</option>
              <option value="204">204</option>
              <option value="205">205</option>
              <option value="301">301</option>
              <option value="302">302</option>
              <option value="303">303</option>
              <option value="304">304</option>
              <option value="305">305</option>
            </select>
            <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">Status (All)</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <select className={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name (A-Z)</option>
              <option value="room">Sort by Room Number</option>
            </select>
          </div>

          {/* Desktop Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>RESIDENT NAME</th>
                    <th className={styles.th}>ROOM NO</th>
                    <th className={styles.th}>PHONE NUMBER</th>
                    <th className={styles.th}>JOINING DATE</th>
                    <th className={styles.th}>RENT STATUS</th>
                    <th className={styles.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyRow}>No residents found.</td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div className={styles.residentCell}>
                            <div className={styles.initAvatar}>{getInitials(r.name)}</div>
                            <span className={styles.residentName}>{r.name}</span>
                          </div>
                        </td>
                        <td className={styles.td}>{r.room}</td>
                        <td className={styles.td}>{r.phone}</td>
                        <td className={styles.td}>{r.moveIn}</td>
                        <td className={styles.td}><StatusPill status={r.status} /></td>
                        <td className={styles.td}>
                          <button className={styles.viewBtn} onClick={() => navigate(`/admin/residents/view/${r.phone}`)}>View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className={styles.mobileCardList}>
            {filtered.length === 0 ? (
              <div className={styles.emptyMobile}>No residents found.</div>
            ) : (
              filtered.map((r) => <ResidentCard key={r.id} r={r} />)
            )}
          </div>

        </div>
      </main>

      <Popup 
        isOpen={popupConfig.isOpen}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
      />

      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
            <button className={`${styles.bottomNavItem} ${activeNav === 'dashboard' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('dashboard')}>
                <span className={styles.bottomNavIcon}><BarChartIcon /></span>
                <span className={styles.bottomNavLabel}>Dashboard</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'residents' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('residents')}>
                <span className={styles.bottomNavIcon}><UsersIcon /></span>
                <span className={styles.bottomNavLabel}>Residents</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'payments' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('payments')}>
                <span className={styles.bottomNavIcon}><PaymentsIcon /></span>
                <span className={styles.bottomNavLabel}>Payments</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'more' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('more')}>
                <span className={styles.bottomNavIcon}><MoreIcon /></span>
                <span className={styles.bottomNavLabel}>More</span>
            </button>
        </nav>
      )}
    </div>
  );
}

/* SVG Icons */
function BarChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="2" width="4" height="19"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function PaymentsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    </svg>
  );
}
