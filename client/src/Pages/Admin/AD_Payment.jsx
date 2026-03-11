import { useState, useEffect, useCallback } from "react";
import styles from "./AD_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Topbar from "./Components/Header/Topbar";
import { PaymentSkeleton } from "./Components/Skeleton/Skeleton";
import exportPDF from "../../Components/exportPDF";
import { useNavigate } from "react-router-dom";
import API from "../../API/axios";

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
  "Other": <IconBank />,
};

const STATUS_CLASS = {
  approved: "paid",
  pending:  "pending",
  rejected: "overdue",
};

const STATUS_LABEL = {
  approved: "Approved",
  pending:  "Pending",
  rejected: "Rejected",
};

/* helpers */
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function buildMonthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    });
  }
  return opts;
}

export default function Admin_Payment() {

  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("payments");
  const [search, setSearch]   = useState("");
  const [month, setMonth]     = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });
  const [status, setStatus]   = useState("All");
  const [mode, setMode]       = useState("All");
  const [tab, setTab]         = useState("residents");
  const [showNotPaid, setShowNotPaid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const monthOptions = buildMonthOptions();

  /* Fetch payments + residents */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [payRes, resRes] = await Promise.all([
        API.get("/payments"),
        API.get("/admin/occupants"),
      ]);
      setPayments(payRes.data || []);
      setResidents(resRes.data?.occupants || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* Build a phone→resident lookup */
  const residentMap = {};
  residents.forEach((r) => { residentMap[r.phoneNumber] = r; });

  /* Merge payment data with resident info */
  const enriched = payments.map((p) => {
    const r = residentMap[p.phoneNumber] || {};
    return {
      id: p._id,
      name: p.name || r.name || "Unknown",
      initials: getInitials(p.name || r.name),
      room: r.roomNumber || "-",
      amount: p.amount || 0,
      rawDate: p.date,
      date: formatDate(p.date),
      mode: p.paymentMethod || "Cash",
      status: p.status || "pending",
      type: r.type || "Resident",
      phoneNumber: p.phoneNumber,
    };
  });

  /* Filter by selected month */
  const [selYear, selMonth] = month.split("-").map(Number);

  const inMonth = enriched.filter((t) => {
    if (!t.rawDate) return true;
    const d = new Date(t.rawDate);
    if (isNaN(d.getTime())) return true;
    return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth;
  });

  /* Split by type */
  const residentPayments = inMonth.filter((t) => t.type === "Resident");
  const guestPayments    = inMonth.filter((t) => t.type === "Guest");
  const activeList = tab === "residents" ? residentPayments : guestPayments;

  /* Apply filters */
  const filtered = activeList.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.room.toLowerCase().includes(search.toLowerCase()) ||
                        t.phoneNumber?.includes(search);
    const matchStatus = status === "All" || t.status === status;
    const matchMode   = mode   === "All" || t.mode   === mode;
    return matchSearch && matchStatus && matchMode;
  });

  /* Summary computations */
  const computeSummary = (list) => {
    const approved = list.filter((t) => t.status === "approved");
    const pending  = list.filter((t) => t.status === "pending");
    const rejected = list.filter((t) => t.status === "rejected");
    return {
      collected: approved.reduce((s, t) => s + t.amount, 0),
      collectedCount: approved.length,
      pendingAmt: pending.reduce((s, t) => s + t.amount, 0),
      pendingCount: pending.length,
      rejectedAmt: rejected.reduce((s, t) => s + t.amount, 0),
      rejectedCount: rejected.length,
    };
  };
  const summary = computeSummary(activeList);

  /* Compute who hasn't paid: residents in active tab with no approved payment this month */
  const paidPhones = new Set(
    activeList.filter((t) => t.status === "approved").map((t) => t.phoneNumber)
  );
  const tabType = tab === "residents" ? "Resident" : "Guest";
  const notPaidList = residents.filter(
    (r) => (r.type || "Resident") === tabType && !paidPhones.has(r.phoneNumber)
  );

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath="payments" />

      <main className={styles.mainContent}>

        <Topbar 
          title="Payments &amp; Billing" 
          currentView="payment"
          searchValue={search}
          onSearchChange={(value) => setSearch(value)}
        />

        <div className={styles.content}>

          {/* Section header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Financial Overview</h2>
            <div className={styles.headerActions}>
              <button className={styles.btnPrimary} onClick={() => { navigate('/admin/payments/verify') }}>Verify Payments</button>
              <button className={styles.btnPrimary} onClick={() => { navigate('/admin/payments/add') }}>+ Record Payment</button>
            </div>
          </div>

          {isLoading ? (
            <PaymentSkeleton />
          ) : (
          <>
          {/* Tabs: Residents / Guests */}
          <div className={styles.tabRow}>
            <button
              className={`${styles.tabBtn} ${tab === "residents" ? styles.tabActive : ""}`}
              onClick={() => setTab("residents")}
            >
              Residents ({residentPayments.length})
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "guests" ? styles.tabActive : ""}`}
              onClick={() => setTab("guests")}
            >
              Guests ({guestPayments.length})
            </button>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Collected This Month</p>
              <p className={styles.summaryValue}>&#8377;{summary.collected.toLocaleString("en-IN")}</p>
              <p className={`${styles.summaryBadge} ${styles.badgeGreen}`}>{summary.collectedCount} Payment{summary.collectedCount !== 1 ? "s" : ""}</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Pending Approval</p>
              <p className={styles.summaryValue}>&#8377;{summary.pendingAmt.toLocaleString("en-IN")}</p>
              <p className={`${styles.summaryBadge} ${styles.badgeYellow}`}>{summary.pendingCount} Payment{summary.pendingCount !== 1 ? "s" : ""}</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Not Paid</p>
              <p className={styles.summaryValue}>{notPaidList.length}</p>
              <div className={styles.notPaidFooter}>
                {notPaidList.length > 0 && (
                  <button className={styles.viewListBtn} onClick={() => setShowNotPaid(true)}>View List</button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterSelects}>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  aria-label="Filter by month"
                >
                  {monthOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
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
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
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
                  <option value="Other">Other</option>
                </select>
                <span className={styles.selectChevron}><IconChevronDown /></span>
              </div>
            </div>

            <button className={styles.btnGhost} onClick={() => exportPDF(
              filtered,
              [
                { label: "Name", accessor: "name" },
                { label: "Room", accessor: "room" },
                { label: "Phone", accessor: "phoneNumber" },
                { label: "Amount", accessor: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
                { label: "Date", accessor: "date" },
                { label: "Payment Mode", accessor: "mode" },
                { label: "Status", accessor: "status" },
              ],
              `payments-${tab}-${month || "all"}.pdf`
            )}>Export PDF</button>
          </div>

          {/* ── Transaction Table (desktop) ── */}
          <div className={styles.tableCard}>
            <div className={styles.tableScrollWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>{tab === "residents" ? "Resident" : "Guest"}</th>
                    <th className={styles.th}>Room No</th>
                    <th className={styles.th}>Phone</th>
                    <th className={styles.th}>Amount</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Payment Mode</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td className={styles.td} colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No payments found</td></tr>
                  ) : filtered.map((t) => (
                    <tr key={t.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.residentCell}>
                          <div className={styles.avatarSmall}>{t.initials}</div>
                          <span className={styles.residentName}>{t.name}</span>
                        </div>
                      </td>
                      <td className={styles.td}>{t.room}</td>
                      <td className={styles.td}>{t.phoneNumber}</td>
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
                          {t.status === "approved" && "\u2713 "}
                          {t.status === "pending" && "\u23F3 "}
                          {t.status === "rejected" && "\u26A0 "}
                          {STATUS_LABEL[t.status]}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          aria-label="View details"
                          onClick={() => navigate('/admin/payments/view', { state: { payment: t } })}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          <div className={styles.mobileCards}>
            {filtered.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No payments found</p>
            ) : filtered.map((t) => (
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
                    {t.status === "approved" && "\u2713 "}
                    {t.status === "pending" && "\u23F3 "}
                    {t.status === "rejected" && "\u26A0 "}
                    {STATUS_LABEL[t.status]}
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
                <div className={styles.txCardActions}>
                  <button className={styles.viewBtn} onClick={() => navigate('/admin/payments/view', { state: { payment: t } })}>View Details</button>
                </div>
              </div>
            ))}
          </div>

          </>
          )}

        </div>
      </main>

      {/* Not Paid Modal */}
      {showNotPaid && (
        <div className={styles.modalOverlay} onClick={() => setShowNotPaid(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Not Paid — {tab === "residents" ? "Residents" : "Guests"}</h3>
              <button className={styles.modalClose} onClick={() => setShowNotPaid(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {notPaidList.length === 0 ? (
                <p className={styles.modalEmpty}>Everyone has paid!</p>
              ) : (
                <ul className={styles.notPaidUl}>
                  {notPaidList.map((r) => (
                    <li key={r.phoneNumber || r._id} className={styles.notPaidLi}>
                      <div className={styles.notPaidInfo}>
                        <div className={styles.avatarSmall}>{getInitials(r.name)}</div>
                        <div>
                          <p className={styles.notPaidName}>{r.name}</p>
                          <p className={styles.notPaidMeta}>Room {r.roomNumber} &middot; {r.phoneNumber}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

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
