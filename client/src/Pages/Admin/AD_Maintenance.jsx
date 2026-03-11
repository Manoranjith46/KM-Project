import { useState, useEffect } from "react";
import styles from "./AD_Maintenance.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Topbar from "./Components/Header/Topbar";
import API from "../../API/axios";
import { ReportsSkeleton, AnnouncementsSkeleton } from "./Components/Skeleton/Skeleton";
import Loader from "../Resident/Components/Loader/Loader";
import Popup from "./Components/Popup/Popup";
import { minDelay } from "../../utils/minDelay";

const CATEGORY_ICONS = {
  Plumbing:   "🔧",
  Electrical: "⚡",
  "Wi-Fi":    "📶",
  Cleaning:   "🧹",
  Other:      "📋",
};

const STATUS_MAP = {
  Pending:       { cls: "statusOpen",       label: "Pending"     },
  "In Progress": { cls: "statusProgress",   label: "In Progress" },
  Resolved:      { cls: "statusResolved",   label: "Resolved"    },
};

const ANNOUNCEMENT_TYPE_MAP = {
  urgent:  { icon: "🚨", cls: "annUrgent",  label: "Urgent"  },
  info:    { icon: "ℹ️",  cls: "annInfo",    label: "Info"    },
  rule:    { icon: "📜", cls: "annRule",    label: "Rule"    },
  general: { icon: "📢", cls: "annGeneral", label: "General" },
};

export default function Admin_Maintenance() {
  const [activeNav, setActiveNav] = useState("maintenance");
  const [activeTab, setActiveTab] = useState("reports");
  const [isMobile, setIsMobile] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statFilter, setStatFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewDesc, setViewDesc] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", message: "", type: "general", icon: "" });
  const [creating, setCreating] = useState(false);

  // Loader & Popup state
  const [loaderText, setLoaderText] = useState("");
  const [popup, setPopup] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await API.get("/admin/reports");
        setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await API.get("/admin/announcements");
        setAnnouncements(data);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      } finally {
        setAnnLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Update report status
  const handleStatusChange = async (reportId, newStatus) => {
    setLoaderText("Updating status...");
    try {
      const { data } = await minDelay(API.patch(`/admin/reports/${reportId}`, { status: newStatus }));
      setReports(prev => prev.map(r => (r._id === reportId ? data : r)));
      setLoaderText("");
      setPopup({ isOpen: true, type: "success", title: "Status Updated", message: `Report status changed to "${newStatus}" successfully.` });
    } catch (err) {
      console.error("Failed to update status:", err);
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Update Failed", message: "Could not update report status. Please try again." });
    }
  };

  // Create announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnn.title.trim() || !newAnn.message.trim()) return;
    setCreating(true);
    setLoaderText("Publishing announcement...");
    try {
      const { data } = await minDelay(API.post("/admin/announcements", newAnn));
      setAnnouncements(prev => [data, ...prev]);
      setNewAnn({ title: "", message: "", type: "general", icon: "" });
      setShowCreateForm(false);
      setLoaderText("");
      setPopup({ isOpen: true, type: "success", title: "Announcement Published", message: "Your announcement has been broadcast to all residents." });
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Publish Failed", message: "Could not publish announcement. Please try again." });
    } finally {
      setCreating(false);
    }
  };

  // Delete announcement — ask via confirm popup
  const handleDeleteAnnouncement = (id) => {
    setPendingDelete(id);
    setPopup({ isOpen: true, type: "confirm", title: "Delete Announcement?", message: "This action cannot be undone. Are you sure you want to delete this announcement?" });
  };

  const confirmDeleteAnnouncement = async () => {
    setPopup({ ...popup, isOpen: false });
    if (!pendingDelete) return;
    setLoaderText("Deleting");
    try {
      await minDelay(API.delete(`/admin/announcements/${pendingDelete}`));
      setAnnouncements(prev => prev.filter(a => a._id !== pendingDelete));
      setLoaderText("");
      setPopup({ isOpen: true, type: "success", title: "Deleted", message: "Announcement has been removed successfully." });
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Delete Failed", message: "Could not delete announcement. Please try again." });
    } finally {
      setPendingDelete(null);
    }
  };

  // Filter reports
  const filtered = reports.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.name?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.phoneNumber?.includes(q);
    const created = new Date(t.createdAt);
    const afterFrom = !dateFrom || created >= new Date(dateFrom);
    const beforeTo = !dateTo || created <= new Date(dateTo + "T23:59:59");

    return (
      matchesSearch &&
      (catFilter === "All" || t.category === catFilter) &&
      (statFilter === "All" || t.status === statFilter) &&
      afterFrom &&
      beforeTo
    );
  });

  const pendingCount = reports.filter((t) => t.status === "Pending").length;
  const progressCount = reports.filter((t) => t.status === "In Progress").length;
  const resolvedCount = reports.filter((t) => t.status === "Resolved").length;

  // Get unique categories from reports
  const categories = [...new Set(reports.map(r => r.category).filter(Boolean))];

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath={"maintenance"} />

      <main className={styles.mainContent}>
        <Topbar
          title="Reports & Announcements"
          subtitle="Manage resident issues and broadcast announcements"
          currentView="maintenance"
          searchValue={activeTab === "reports" ? search : ""}
          onSearchChange={activeTab === "reports" ? setSearch : undefined}
        />

        {/* ─── Tab Switch ─── */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === "reports" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            🔧 Reports
          </button>
          <button
            className={`${styles.tab} ${activeTab === "announcements" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            📢 Announcements
          </button>
        </div>

        {/* ═══════════ REPORTS TAB ═══════════ */}
        {activeTab === "reports" && (
          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <div className={styles.heroLeft}>
                <h2 className={styles.sectionTitle}>Helpdesk Tickets</h2>
                <p className={styles.sectionDate}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {reportsLoading ? (
              <ReportsSkeleton />
            ) : (
              <>
            {/* Stat cards */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Pending</span>
                <span className={styles.statValue}>{pendingCount}</span>
                <span className={`${styles.statBadge} ${styles.badgeRed}`}>Needs attention</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>In Progress</span>
                <span className={styles.statValue}>{progressCount}</span>
                <span className={`${styles.statBadge} ${styles.badgeYellow}`}>Being handled</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Resolved</span>
                <span className={styles.statValue}>{resolvedCount}</span>
                <span className={`${styles.statBadge} ${styles.badgeGreen}`}>Completed</span>
              </div>
            </div>

            {/* Filters */}
            <div className={styles.filterRow}>
              <select className={styles.filterSelect} value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Filter by category">
                <option value="All">Category (All)</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select className={styles.filterSelect} value={statFilter} onChange={(e) => setStatFilter(e.target.value)} aria-label="Filter by status">
                <option value="All">Status (All)</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <div className={styles.dateFilterGroup}>
                <label className={styles.dateLabel}>From</label>
                <input type="date" className={styles.dateInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className={styles.dateFilterGroup}>
                <label className={styles.dateLabel}>To</label>
                <input type="date" className={styles.dateInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              {(dateFrom || dateTo) && (
                <button className={styles.clearDateBtn} onClick={() => { setDateFrom(""); setDateTo(""); }}>✕ Clear Dates</button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className={styles.emptyState}>No reports found</div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className={styles.tableCard}>
                  <div className={styles.tableScrollWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>RESIDENT</th>
                          <th>CATEGORY</th>
                          <th>DESCRIPTION</th>
                          <th>DATE RAISED</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((t) => {
                          const s = STATUS_MAP[t.status] || STATUS_MAP["Pending"];
                          const initials = t.name
                            ? t.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                            : "?";
                          return (
                            <tr key={t._id}>
                              <td>
                                <div className={styles.residentCell}>
                                  <span className={styles.avatarSmall}>{initials}</span>
                                  <div>
                                    <div className={styles.residentName}>{t.name}</div>
                                    <div className={styles.residentRoom}>{t.phoneNumber}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={styles.categoryCell}>
                                  <span className={styles.catIcon}>{CATEGORY_ICONS[t.category] || "📋"}</span>
                                  {t.category}
                                </span>
                              </td>
                              <td className={styles.descCell}>
                                <button className={styles.viewDescBtn} onClick={() => setViewDesc(t)}>View</button>
                              </td>
                              <td className={styles.dateCell}>
                                {new Date(t.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td>
                                <span className={`${styles.statusPill} ${styles[s.cls]}`}>{s.label}</span>
                              </td>
                              <td>
                                <select
                                  className={styles.statusSelect}
                                  value={t.status}
                                  onChange={(e) => handleStatusChange(t._id, e.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Ticket Cards */}
                <div className={styles.mobileCards}>
                  {filtered.map((t) => {
                    const s = STATUS_MAP[t.status] || STATUS_MAP["Pending"];
                    const initials = t.name
                      ? t.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                      : "?";
                    return (
                      <div key={t._id} className={styles.ticketCard}>
                        <div className={styles.tcHeader}>
                          <div className={styles.tcLeft}>
                            <span className={styles.avatarSmall}>{initials}</span>
                            <div>
                              <div className={styles.residentName}>{t.name}</div>
                              <div className={styles.residentRoom}>{t.phoneNumber}</div>
                            </div>
                          </div>
                          <div className={styles.tcRight}>
                            <span className={`${styles.statusPill} ${styles[s.cls]}`}>{s.label}</span>
                          </div>
                        </div>
                        <div className={styles.tcDivider} />
                        <div className={styles.tcMeta}>
                          <div className={styles.tcMetaItem}>
                            <span className={styles.tcMetaLabel}>CATEGORY</span>
                            <span className={styles.tcMetaValue}>
                              {CATEGORY_ICONS[t.category] || "📋"} {t.category}
                            </span>
                          </div>
                          <div className={styles.tcMetaItem}>
                            <span className={styles.tcMetaLabel}>DATE RAISED</span>
                            <span className={styles.tcMetaValue}>
                              {new Date(t.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <div className={styles.tcMetaItem}>
                            <span className={styles.tcMetaLabel}>DESCRIPTION</span>
                            <button className={styles.viewDescBtn} onClick={() => setViewDesc(t)}>View</button>
                          </div>
                        </div>
                        <select
                          className={styles.statusSelectFull}
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            </>
            )}
          </div>
        )}

        {/* ═══════════ ANNOUNCEMENTS TAB ═══════════ */}
        {activeTab === "announcements" && (
          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <div className={styles.heroLeft}>
                <h2 className={styles.sectionTitle}>Announcements</h2>
                <p className={styles.sectionDate}>Broadcast notices to all residents</p>
              </div>
              <button className={styles.primaryBtn} onClick={() => setShowCreateForm((v) => !v)}>
                {showCreateForm ? "✕ Cancel" : "+ New Announcement"}
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form className={styles.annForm} onSubmit={handleCreateAnnouncement}>
                <div className={styles.annFormRow}>
                  <input
                    className={styles.annInput}
                    type="text"
                    placeholder="Announcement title"
                    value={newAnn.title}
                    onChange={(e) => setNewAnn((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                  <select
                    className={styles.annSelect}
                    value={newAnn.type}
                    onChange={(e) => setNewAnn((p) => ({ ...p, type: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="info">Info</option>
                    <option value="rule">Rule</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <textarea
                  className={styles.annTextarea}
                  placeholder="Write your announcement message..."
                  rows={3}
                  value={newAnn.message}
                  onChange={(e) => setNewAnn((p) => ({ ...p, message: e.target.value }))}
                  required
                />
                <button type="submit" className={styles.primaryBtn} disabled={creating}>
                  {creating ? "Publishing..." : "Publish Announcement"}
                </button>
              </form>
            )}

            {annLoading ? (
              <AnnouncementsSkeleton />
            ) : (
            <>
            {/* Announcements List */}
            {announcements.length === 0 ? (
              <div className={styles.emptyState}>No announcements yet. Create one above!</div>
            ) : (
              <div className={styles.annList}>
                {announcements.map((ann) => {
                  const typeInfo = ANNOUNCEMENT_TYPE_MAP[ann.type] || ANNOUNCEMENT_TYPE_MAP.general;
                  return (
                    <div key={ann._id} className={`${styles.annCard} ${styles[typeInfo.cls]}`}>
                      <div className={styles.annCardHeader}>
                        <div className={styles.annCardLeft}>
                          <span className={styles.annIcon}>{typeInfo.icon}</span>
                          <div>
                            <h3 className={styles.annTitle}>{ann.title}</h3>
                            <span className={`${styles.annTypeBadge} ${styles[typeInfo.cls + "Badge"]}`}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </div>
                        <button className={styles.annDeleteBtn} onClick={() => handleDeleteAnnouncement(ann._id)} title="Delete announcement">
                          🗑️
                        </button>
                      </div>
                      <p className={styles.annMessage}>{ann.message}</p>
                      <span className={styles.annDate}>
                        {new Date(ann.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            </>
            )}
          </div>
        )}
      </main>

      {/* ═══════════ LOADER ═══════════ */}
      {loaderText && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text={loaderText} />
          </div>
        </div>
      )}

      {/* ═══════════ POPUP ═══════════ */}
      <Popup
        isOpen={popup.isOpen}
        onClose={() => { setPopup({ ...popup, isOpen: false }); setPendingDelete(null); }}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onConfirm={popup.type === "confirm" ? confirmDeleteAnnouncement : undefined}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* ═══════════ DESCRIPTION MODAL ═══════════ */}
      {viewDesc && (
        <div className={styles.descOverlay} onClick={() => setViewDesc(null)}>
          <div className={styles.descModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.descModalHeader}>
              <h3 className={styles.descModalTitle}>Report Details</h3>
              <button className={styles.descModalClose} onClick={() => setViewDesc(null)}>✕</button>
            </div>
            <div className={styles.descModalBody}>
              <div className={styles.descModalRow}>
                <span className={styles.descModalLabel}>Resident</span>
                <span className={styles.descModalValue}>{viewDesc.name}</span>
              </div>
              <div className={styles.descModalRow}>
                <span className={styles.descModalLabel}>Phone</span>
                <span className={styles.descModalValue}>{viewDesc.phoneNumber}</span>
              </div>
              <div className={styles.descModalRow}>
                <span className={styles.descModalLabel}>Category</span>
                <span className={styles.descModalValue}>{CATEGORY_ICONS[viewDesc.category] || "📋"} {viewDesc.category}</span>
              </div>
              <div className={styles.descModalRow}>
                <span className={styles.descModalLabel}>Status</span>
                <span className={`${styles.statusPill} ${styles[STATUS_MAP[viewDesc.status]?.cls || "statusOpen"]}`}>{viewDesc.status}</span>
              </div>
              <div className={styles.descModalRow}>
                <span className={styles.descModalLabel}>Date</span>
                <span className={styles.descModalValue}>{new Date(viewDesc.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div className={styles.descModalDescBlock}>
                <span className={styles.descModalLabel}>Description</span>
                <p className={styles.descModalDesc}>{viewDesc.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
          <button className={`${styles.bottomNavItem} ${activeNav === "dashboard" ? styles.active : ""}`} onClick={() => setActiveNav("dashboard")}>
            <span className={styles.bottomNavIcon}>📊</span>
            <span className={styles.bottomNavLabel}>Dashboard</span>
          </button>
          <button className={`${styles.bottomNavItem} ${activeNav === "residents" ? styles.active : ""}`} onClick={() => setActiveNav("residents")}>
            <span className={styles.bottomNavIcon}>👥</span>
            <span className={styles.bottomNavLabel}>Residents</span>
          </button>
          <button className={`${styles.bottomNavItem} ${activeNav === "payments" ? styles.active : ""}`} onClick={() => setActiveNav("payments")}>
            <span className={styles.bottomNavIcon}>💳</span>
            <span className={styles.bottomNavLabel}>Payments</span>
          </button>
          <button className={`${styles.bottomNavItem} ${activeNav === "maintenance" ? styles.active : ""}`} onClick={() => setActiveNav("maintenance")}>
            <span className={styles.bottomNavIcon}>🔧</span>
            <span className={styles.bottomNavLabel}>More</span>
          </button>
        </nav>
      )}
    </div>
  );
}
