import { useState, useEffect } from "react";
import styles from "./AD_Maintenance.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";

/* ─── Static mock data ─── */
const TICKETS = [
  { id: "#TKT-042", resident: "Rahul Sharma",  room: "101", initials: "RS", category: "Plumbing",   desc: "Water leakage under sink in bathroom",   date: "24 Feb 2026", status: "Open",        priority: "High"   },
  { id: "#TKT-041", resident: "Priya Patel",   room: "205", initials: "PP", category: "Electrical", desc: "Power socket not working near study desk", date: "23 Feb 2026", status: "In Progress", priority: "Medium" },
  { id: "#TKT-040", resident: "Amit Kumar",    room: "312", initials: "AK", category: "Wi-Fi",      desc: "Intermittent connectivity on floor 3",    date: "22 Feb 2026", status: "In Progress", priority: "Medium" },
  { id: "#TKT-039", resident: "Sneha Reddy",   room: "108", initials: "SR", category: "Cleaning",   desc: "Common area bathroom not cleaned today",  date: "22 Feb 2026", status: "Resolved",    priority: "Low"    },
  { id: "#TKT-038", resident: "Vikram Singh",  room: "204", initials: "VS", category: "Plumbing",   desc: "Clogged drain in attached bathroom",      date: "21 Feb 2026", status: "Open",        priority: "High"   },
  { id: "#TKT-037", resident: "Anjali Verma",  room: "301", initials: "AV", category: "Electrical", desc: "Ceiling fan running at single speed only", date: "20 Feb 2026", status: "Resolved",    priority: "Low"    },
  { id: "#TKT-036", resident: "Karan Mehta",   room: "407", initials: "KM", category: "Wi-Fi",      desc: "No signal in room, works in corridor",    date: "20 Feb 2026", status: "Open",        priority: "High"   },
  { id: "#TKT-035", resident: "Divya Nair",    room: "115", initials: "DN", category: "Cleaning",   desc: "Dustbin overflow near room 115",          date: "19 Feb 2026", status: "Resolved",    priority: "Low"    },
];

const CATEGORY_ICONS = {
  Plumbing:   "🔧",
  Electrical: "⚡",
  "Wi-Fi":    "📶",
  Cleaning:   "🧹",
};

const STATUS_MAP = {
  Open:        { cls: "statusOpen",       label: "Open"        },
  "In Progress": { cls: "statusProgress", label: "In Progress" },
  Resolved:    { cls: "statusResolved",   label: "Resolved"    },
};

const PRIORITY_MAP = {
  High:   { cls: "priorityHigh",   label: "High"   },
  Medium: { cls: "priorityMedium", label: "Medium" },
  Low:    { cls: "priorityLow",    label: "Low"    },
};

export default function Admin_Maintenance() {
  const [activeNav, setActiveNav] = useState("maintenance");
  const [catFilter,  setCatFilter]  = useState("All");
  const [statFilter, setStatFilter] = useState("All");
  const [priFilter,  setPriFilter]  = useState("All");
  const [openKebab,  setOpenKebab]  = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filtered = TICKETS.filter(t =>
    (catFilter  === "All" || t.category === catFilter) &&
    (statFilter === "All" || t.status   === statFilter) &&
    (priFilter  === "All" || t.priority === priFilter)
  );

  const openCount     = TICKETS.filter(t => t.status === "Open").length;
  const progressCount = TICKETS.filter(t => t.status === "In Progress").length;
  const resolvedCount = TICKETS.filter(t => t.status === "Resolved").length;

  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Floating Background Blobs ── */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <Sidebar currentPath={'maintenance'} />

      {/* ── Main Content ── */}
      <main className={styles.mainContent}>

        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Maintenance &amp; Repairs</h1>
              <p className={styles.pageSubtitle}>Manage resident requests and facility issues</p>
            </div>
          </div>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className={styles.searchInput} type="text" placeholder="Search tickets, rooms..." aria-label="Search tickets" />
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.content}>

          {/* Hero band */}
          <div className={styles.sectionHeader}>
            <div className={styles.heroLeft}>
              <h2 className={styles.sectionTitle}>Helpdesk Tickets</h2>
              <p className={styles.sectionDate}>Monday, 24 Feb 2026</p>
            </div>
            <button className={styles.primaryBtn}>+ Create Ticket</button>
          </div>

          {/* Stat cards */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Open Tickets</span>
              <span className={styles.statValue}>{openCount}</span>
              <span className={`${styles.statBadge} ${styles.badgeRed}`}>3 High Priority</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>In Progress</span>
              <span className={styles.statValue}>{progressCount}</span>
              <span className={`${styles.statBadge} ${styles.badgeYellow}`}>Assigned to staff</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Resolved (This Week)</span>
              <span className={styles.statValue}>{resolvedCount}</span>
              <span className={`${styles.statBadge} ${styles.badgeGreen}`}>Avg time: 4 hours</span>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filterRow}>
            <select className={styles.filterSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)} aria-label="Filter by category">
              <option value="All">Category (All)</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Cleaning">Cleaning</option>
            </select>
            <select className={styles.filterSelect} value={statFilter} onChange={e => setStatFilter(e.target.value)} aria-label="Filter by status">
              <option value="All">Status (All)</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select className={styles.filterSelect} value={priFilter} onChange={e => setPriFilter(e.target.value)} aria-label="Filter by priority">
              <option value="All">Priority (All)</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* ── Desktop Table ── */}
          <div className={styles.tableCard}>
            <div className={styles.tableScrollWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>TICKET ID</th>
                    <th>RESIDENT</th>
                    <th>CATEGORY</th>
                    <th>DESCRIPTION</th>
                    <th>DATE RAISED</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const s = STATUS_MAP[t.status];
                    const p = PRIORITY_MAP[t.priority];
                    return (
                      <tr key={t.id}>
                        <td className={styles.ticketId}>{t.id}</td>
                        <td>
                          <div className={styles.residentCell}>
                            <span className={styles.avatarSmall}>{t.initials}</span>
                            <div>
                              <div className={styles.residentName}>{t.resident}</div>
                              <div className={styles.residentRoom}>Room {t.room}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.categoryCell}>
                            <span className={styles.catIcon}>{CATEGORY_ICONS[t.category]}</span>
                            {t.category}
                          </span>
                        </td>
                        <td className={styles.descCell}>{t.desc}</td>
                        <td className={styles.dateCell}>{t.date}</td>
                        <td><span className={`${styles.priorityPill} ${styles[p.cls]}`}>{p.label}</span></td>
                        <td><span className={`${styles.statusPill} ${styles[s.cls]}`}>{s.label}</span></td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button className={styles.assignBtn}>Assign Staff</button>
                            <div className={styles.kebabWrap}>
                              <button
                                className={styles.kebabBtn}
                                onClick={() => setOpenKebab(openKebab === t.id ? null : t.id)}
                                aria-label="More actions"
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                              </button>
                              {openKebab === t.id && (
                                <div className={styles.kebabMenu} role="menu">
                                  <button role="menuitem" onClick={() => setOpenKebab(null)}>Update Status</button>
                                  <button role="menuitem" onClick={() => setOpenKebab(null)}>View Details</button>
                                  <button role="menuitem" className={styles.deleteItem} onClick={() => setOpenKebab(null)}>Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Ticket Cards ── */}
          <div className={styles.mobileCards}>
            {filtered.map(t => {
              const s = STATUS_MAP[t.status];
              const p = PRIORITY_MAP[t.priority];
              return (
                <div key={t.id} className={styles.ticketCard}>
                  <div className={styles.tcHeader}>
                    <div className={styles.tcLeft}>
                      <span className={styles.avatarSmall}>{t.initials}</span>
                      <div>
                        <div className={styles.residentName}>{t.resident}</div>
                        <div className={styles.residentRoom}>Room {t.room} &middot; {t.id}</div>
                      </div>
                    </div>
                    <div className={styles.tcRight}>
                      <span className={`${styles.statusPill} ${styles[s.cls]}`}>{s.label}</span>
                      <div className={styles.kebabWrap}>
                        <button
                          className={styles.kebabBtn}
                          onClick={() => setOpenKebab(openKebab === t.id ? null : t.id)}
                          aria-label="More actions"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                        </button>
                        {openKebab === t.id && (
                          <div className={styles.kebabMenu} role="menu">
                            <button role="menuitem" onClick={() => setOpenKebab(null)}>Update Status</button>
                            <button role="menuitem" onClick={() => setOpenKebab(null)}>View Details</button>
                            <button role="menuitem" className={styles.deleteItem} onClick={() => setOpenKebab(null)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.tcDivider} />
                  <div className={styles.tcMeta}>
                    <div className={styles.tcMetaItem}>
                      <span className={styles.tcMetaLabel}>CATEGORY</span>
                      <span className={styles.tcMetaValue}>
                        {CATEGORY_ICONS[t.category]} {t.category}
                      </span>
                    </div>
                    <div className={styles.tcMetaItem}>
                      <span className={styles.tcMetaLabel}>PRIORITY</span>
                      <span className={`${styles.priorityPill} ${styles[p.cls]}`}>{p.label}</span>
                    </div>
                    <div className={styles.tcMetaItem}>
                      <span className={styles.tcMetaLabel}>DATE RAISED</span>
                      <span className={styles.tcMetaValue}>{t.date}</span>
                    </div>
                    <div className={styles.tcMetaItem}>
                      <span className={styles.tcMetaLabel}>DESCRIPTION</span>
                      <span className={styles.tcMetaValue}>{t.desc}</span>
                    </div>
                  </div>
                  <button className={styles.assignBtnFull}>Assign Staff</button>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* ══════════ BOTTOM NAV (Mobile Only) ══════════ */}
      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
            <button className={`${styles.bottomNavItem} ${activeNav === 'dashboard' ? styles.active : ""}`} onClick={() => setActiveNav('dashboard')}>
                <span className={styles.bottomNavIcon}>📊</span>
                <span className={styles.bottomNavLabel}>Dashboard</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'residents' ? styles.active : ""}`} onClick={() => setActiveNav('residents')}>
                <span className={styles.bottomNavIcon}>👥</span>
                <span className={styles.bottomNavLabel}>Residents</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'payments' ? styles.active : ""}`} onClick={() => setActiveNav('payments')}>
                <span className={styles.bottomNavIcon}>💳</span>
                <span className={styles.bottomNavLabel}>Payments</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'maintenance' ? styles.active : ""}`} onClick={() => setActiveNav('maintenance')}>
                <span className={styles.bottomNavIcon}>🔧</span>
                <span className={styles.bottomNavLabel}>More</span>
            </button>
        </nav>
      )}
    </div>
  );
}