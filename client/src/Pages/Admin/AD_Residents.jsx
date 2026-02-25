import { useState, useEffect } from "react";
import styles from "./AD_Residents.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";

/* ─── Static mock data ─── */
const RESIDENTS = [
  { id: 1, name: "Rahul Sharma",  room: "101", phone: "98765 43210", moveIn: "01 Jan 2025", status: "Paid" },
  { id: 2, name: "Priya Patel",   room: "205", phone: "91234 56789", moveIn: "15 Nov 2024", status: "Pending" },
  { id: 3, name: "Amit Kumar",    room: "312", phone: "99887 76655", moveIn: "10 Oct 2024", status: "Paid" },
  { id: 4, name: "Sneha Reddy",   room: "108", phone: "87654 32109", moveIn: "20 Dec 2024", status: "Paid" },
  { id: 5, name: "Vikram Singh",  room: "204", phone: "76543 21098", moveIn: "05 Sep 2024", status: "Overdue" },
  { id: 6, name: "Anjali Verma",  room: "301", phone: "65432 10987", moveIn: "12 Feb 2025", status: "Paid" },
  { id: 7, name: "Karan Mehta",   room: "407", phone: "54321 09876", moveIn: "03 Mar 2025", status: "Pending" },
  { id: 8, name: "Divya Nair",    room: "502", phone: "43210 98765", moveIn: "22 Jan 2025", status: "Paid" },
];

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
          <KebabMenu />
        </div>
      </div>
      <div className={styles.residentCardMeta}>
        <div className={styles.residentCardMetaItem}>
          <span className={styles.residentCardMetaLabel}>Phone</span>
          <span className={styles.residentCardMetaValue}>{r.phone}</span>
        </div>
        <div className={styles.residentCardMetaItem}>
          <span className={styles.residentCardMetaLabel}>Move-in</span>
          <span className={styles.residentCardMetaValue}>{r.moveIn}</span>
        </div>
      </div>
    </div>
  );
}

export default function AD_Residents() {
  const [activeNav, setActiveNav] = useState("residents");
  const [search, setSearch]       = useState("");
  const [floor, setFloor]         = useState("All");
  const [roomType, setRoomType]   = useState("All");
  const [statusFilter, setStatus] = useState("Active");
  const [isMobile, setIsMobile]   = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filtered = RESIDENTS.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.room.includes(q) ||
      r.phone.includes(q)
    );
  });

  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Floating Background Blobs ── */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* ── Sidebar (desktop only) ── */}
      <Sidebar currentPath={'residents'} />

      {/* ── Main Content ── */}
      <main className={styles.mainContent}>

        {/* ── Top Nav ── */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Residents Directory</h1>
            </div>
          </div>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search residents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.topNavRight}>
            <div className={styles.avatar}>A</div>
          </div>
        </header>

        {/* ── Scrollable Content Area ── */}
        <div className={styles.content}>

          {/* Header Row */}
          <div className={styles.contentHeader}>
            <h2 className={styles.sectionTitle}>All Residents</h2>
            <button className={styles.addBtn}>+ Add Resident</button>
          </div>

          {/* Quick Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Active</span>
              <span className={styles.statValue}>124</span>
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

          {/* Filters */}
          <div className={styles.filterRow}>
            <select className={styles.filterSelect} value={floor} onChange={(e) => setFloor(e.target.value)}>
              <option value="All">Floor (All)</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
              <option value="5">Floor 5</option>
            </select>
            <select className={styles.filterSelect} value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="All">Room Type (All)</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
            </select>
            <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Status (Active)</option>
              <option value="Inactive">Inactive</option>
              <option value="Notice">On Notice</option>
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
                    <th className={styles.th}>MOVE-IN DATE</th>
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
                        <td className={styles.td}><KebabMenu /></td>
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

      {/* ── Bottom Nav (mobile ≤768px) ── */}
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

/* ─── SVG Icons ─── */
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