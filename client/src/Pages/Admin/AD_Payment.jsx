import { useState, useEffect } from "react";
import styles from "./AD_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";

/* ── Mock data ── */
const TRANSACTIONS = [
  { id: 1,  name: "Rahul Sharma",  initials: "RS", room: "101", amount: 8500,  date: "01 Feb 2026", mode: "UPI",           status: "Paid"    },
  { id: 2,  name: "Priya Patel",   initials: "PP", room: "205", amount: 8500,  date: "Due",          mode: "Cash",          status: "Pending" },
  { id: 3,  name: "Amit Kumar",    initials: "AK", room: "312", amount: 8500,  date: "28 Jan 2026",  mode: "Bank Transfer", status: "Paid"    },
  { id: 4,  name: "Sneha Reddy",   initials: "SR", room: "108", amount: 8500,  date: "30 Jan 2026",  mode: "UPI",           status: "Paid"    },
  { id: 5,  name: "Vikram Singh",  initials: "VS", room: "204", amount: 8500,  date: "15 Jan 2026",  mode: "Cash",          status: "Overdue" },
  { id: 6,  name: "Anjali Verma",  initials: "AV", room: "301", amount: 8500,  date: "02 Feb 2026",  mode: "Bank Transfer", status: "Paid"    },
  { id: 7,  name: "Karan Mehta",   initials: "KM", room: "407", amount: 8500,  date: "Due",          mode: "UPI",           status: "Pending" },
  { id: 8,  name: "Deepa Nair",    initials: "DN", room: "502", amount: 8500,  date: "10 Jan 2026",  mode: "Cash",          status: "Overdue" },
  { id: 9,  name: "Rohan Gupta",   initials: "RG", room: "210", amount: 8500,  date: "05 Feb 2026",  mode: "UPI",           status: "Paid"    },
  { id: 10, name: "Meena Iyer",    initials: "MI", room: "315", amount: 8500,  date: "Due",          mode: "Bank Transfer", status: "Pending" },
];

/* ── SVG Icons ── */
function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconResidents() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconPayments() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconUPI() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12" y2="18"/>
    </svg>
  );
}
function IconCash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconBank() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/>
      <line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/>
      <line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/>
      <polygon points="12 2 20 7 4 7"/>
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
function IconKebab() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" fill="currentColor"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <circle cx="12" cy="19" r="1" fill="currentColor"/>
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

const PAYMENT_MODE_ICON = {
  "UPI": <IconUPI />,
  "Cash": <IconCash />,
  "Bank Transfer": <IconBank />,
};

const STATUS_CLASS = {
  Paid:    "paid",
  Pending: "pending",
  Overdue: "overdue",
};

export default function Admin_Payment() {
  const [activeNav, setActiveNav] = useState("payments");
  const [search, setSearch]   = useState("");
  const [month, setMonth]     = useState("Feb 2026");
  const [status, setStatus]   = useState("All");
  const [mode, setMode]       = useState("All");
  const [openKebab, setOpenKebab] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filtered = TRANSACTIONS.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.room.includes(search);
    const matchStatus = status === "All" || t.status === status;
    const matchMode   = mode   === "All" || t.mode   === mode;
    return matchSearch && matchStatus && matchMode;
  });

  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Floating Background Blobs ── */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <Sidebar currentPath={'payments'} />

      {/* ── Main Content ── */}
      <main className={styles.mainContent}>

        {/* ── Top Nav ── */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Payments &amp; Billing</h1>
            </div>
          </div>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><IconSearch /></span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search transactions, residents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search transactions"
            />
          </div>
          <div className={styles.topNavRight}>
            <button className={styles.bellBtn} aria-label="Notifications">
              <IconBell />
              <span className={styles.bellDot} aria-hidden="true" />
            </button>
            <div className={styles.avatar} aria-label="Admin profile">A</div>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <div className={styles.content}>

          {/* Section header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Financial Overview</h2>
            <button className={styles.btnPrimary}>+ Record Payment</button>
          </div>

          {/* ── Summary Cards ── */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Collected This Month</p>
              <p className={styles.summaryValue}>&#8377;1,85,000</p>
              <p className={`${styles.summaryBadge} ${styles.badgeGreen}`}>+15% vs last month</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Pending Dues</p>
              <p className={styles.summaryValue}>&#8377;42,500</p>
              <p className={`${styles.summaryBadge} ${styles.badgeYellow}`}>12 Residents</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Overdue (Critical)</p>
              <p className={styles.summaryValue}>&#8377;17,000</p>
              <p className={`${styles.summaryBadge} ${styles.badgeRed}`}>3 Residents</p>
            </div>
          </div>

          {/* ── Filter Row ── */}
          <div className={styles.filterRow}>
            <div className={styles.filterSelects}>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  aria-label="Filter by month"
                >
                  <option>Feb 2026</option>
                  <option>Jan 2026</option>
                  <option>Dec 2025</option>
                </select>
                <span className={styles.selectChevron}><IconChevronDown /></span>
              </div>

              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="All">Status (All)</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <span className={styles.selectChevron}><IconChevronDown /></span>
              </div>

              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  aria-label="Filter by payment mode"
                >
                  <option value="All">Payment Mode (All)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <span className={styles.selectChevron}><IconChevronDown /></span>
              </div>
            </div>

            <button className={styles.btnGhost}>Export CSV</button>
          </div>

          {/* ── Transaction Table (desktop) ── */}
          <div className={styles.tableCard}>
            <div className={styles.tableScrollWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Resident</th>
                    <th className={styles.th}>Room No</th>
                    <th className={styles.th}>Amount</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Payment Mode</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.residentCell}>
                          <div className={styles.avatarSmall}>{t.initials}</div>
                          <span className={styles.residentName}>{t.name}</span>
                        </div>
                      </td>
                      <td className={styles.td}>{t.room}</td>
                      <td className={styles.td}>&#8377;{t.amount.toLocaleString("en-IN")}</td>
                      <td className={styles.td}>{t.date}</td>
                      <td className={styles.td}>
                        <div className={styles.modeCell}>
                          <span className={styles.modeIcon}>{PAYMENT_MODE_ICON[t.mode]}</span>
                          {t.mode}
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.pill} ${styles[STATUS_CLASS[t.status]]}`}>
                          {t.status === "Paid" && "\u2713 "}
                          {t.status === "Pending" && "\u23F3 "}
                          {t.status === "Overdue" && "\u26A0 "}
                          {t.status}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} aria-label="Download receipt">
                            <IconDownload />
                          </button>
                          <div className={styles.kebabWrap}>
                            <button
                              className={styles.actionBtn}
                              aria-label="More options"
                              onClick={() => setOpenKebab(openKebab === t.id ? null : t.id)}
                            >
                              <IconKebab />
                            </button>
                            {openKebab === t.id && (
                              <div className={styles.kebabMenu}>
                                <button className={styles.kebabItem}>View Details</button>
                                <button className={styles.kebabItem}>Send Reminder</button>
                                <button className={styles.kebabItem}>Mark as Paid</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile transaction cards ── */}
          <div className={styles.mobileCards}>
            {filtered.map((t) => (
              <div key={t.id} className={styles.txCard}>
                <div className={styles.txCardTop}>
                  <div className={styles.residentCell}>
                    <div className={styles.avatarSmall}>{t.initials}</div>
                    <div>
                      <p className={styles.txName}>{t.name}</p>
                      <p className={styles.txRoom}>Room {t.room}</p>
                    </div>
                  </div>
                  <span className={`${styles.pill} ${styles[STATUS_CLASS[t.status]]}`}>
                    {t.status === "Paid" && "\u2713 "}
                    {t.status === "Pending" && "\u23F3 "}
                    {t.status === "Overdue" && "\u26A0 "}
                    {t.status}
                  </span>
                </div>
                <div className={styles.txCardDivider} />
                <div className={styles.txCardMeta}>
                  <div className={styles.txMetaItem}>
                    <span className={styles.txMetaLabel}>AMOUNT</span>
                    <span className={styles.txMetaValue}>&#8377;{t.amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className={styles.txMetaItem}>
                    <span className={styles.txMetaLabel}>DATE</span>
                    <span className={styles.txMetaValue}>{t.date}</span>
                  </div>
                  <div className={styles.txMetaItem}>
                    <span className={styles.txMetaLabel}>MODE</span>
                    <span className={styles.txMetaValue}>
                      <span className={styles.modeIcon}>{PAYMENT_MODE_ICON[t.mode]}</span>
                      {t.mode}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* ── Bottom Nav (mobile) ── */}
      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
            <button className={`${styles.bottomNavItem} ${activeNav === 'dashboard' ? styles.bottomNavActive : ""}`} onClick={() => setActiveNav('dashboard')}>
                <span className={styles.bottomNavIcon}><IconDashboard /></span>
                <span className={styles.bottomNavLabel}>Dashboard</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'residents' ? styles.bottomNavActive : ""}`} onClick={() => setActiveNav('residents')}>
                <span className={styles.bottomNavIcon}><IconResidents /></span>
                <span className={styles.bottomNavLabel}>Residents</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'payments' ? styles.bottomNavActive : ""}`} onClick={() => setActiveNav('payments')}>
                <span className={styles.bottomNavIcon}><IconPayments /></span>
                <span className={styles.bottomNavLabel}>Payments</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'more' ? styles.bottomNavActive : ""}`} onClick={() => setActiveNav('more')}>
                <span className={styles.bottomNavIcon}><IconSettings /></span>
                <span className={styles.bottomNavLabel}>More</span>
            </button>
        </nav>
      )}
    </div>
  );
}