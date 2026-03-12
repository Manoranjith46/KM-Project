import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AD_Residents.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Topbar from "./Components/Header/Topbar";
import Popup from "./Components/Popup/Popup";
import { ResidentsSkeleton } from "./Components/Skeleton/Skeleton";
import API from "../../API/axios";

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function TypeBadge({ type }) {
  const isGuest = type === "Guest";
  return (
    <span className={`${styles.typeBadge} ${isGuest ? styles.typeGuest : styles.typeResident}`}>
      {isGuest ? "👤 Guest" : "🏠 Resident"}
    </span>
  );
}

/* ── Mobile Resident Card ── */
function OccupantCard({ r, navigate }) {
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
          <TypeBadge type={r.type} />
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
      <div className={styles.residentCardActions}>
        <button className={styles.viewBtn} onClick={() => navigate(`/admin/residents/view/${r.phone}`)}>View</button>
      </div>
    </div>
  );
}

export default function AD_Residents() {

  const navigate = useNavigate();
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, type: '', title: '', message: '' });

  const [occupants, setOccupants] = useState([]);
  const [counts, setCounts] = useState({ total: 0, residents: 0, guests: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomNumberFilter, setRoomNumberFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    const fetchOccupants = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await API.get('/admin/occupants');
        const data = response.data;

        setCounts({
          total: data.total || 0,
          residents: data.totalResidents || 0,
          guests: data.totalGuests || 0,
        });

        const normalized = (data.occupants || []).map((o, index) => ({
          id: o._id || index,
          name: o.name || '',
          room: o.roomNumber || '-',
          phone: o.phoneNumber || '-',
          type: o.type || 'Resident',
          moveIn: o.joiningDate ? new Date(o.joiningDate).toLocaleDateString('en-GB') : '-',
        }));

        setOccupants(normalized);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Something went wrong.';
        setError(errorMsg);
        setOccupants([]);
        setPopupConfig({
          isOpen: true,
          type: 'error',
          title: 'Error Loading Data',
          message: errorMsg
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOccupants();
  }, []);

  // Filter and sort occupants
  const filtered = occupants
    .filter((r) => {
      const roomMatch = roomNumberFilter === "All" || r.room === roomNumberFilter;
      const typeMatch = typeFilter === "All" || r.type === typeFilter;
      return roomMatch && typeMatch;
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

      <Sidebar currentPath={'residents'} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.mainContent}>

        <Topbar 
          title="Residents Directory"
          currentView="resident"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>

          {/* Header Row */}
          <div className={styles.contentHeader}>
            <h2 className={styles.sectionTitle}>All Occupants</h2>
            <button className={styles.addBtn} onClick={() => {navigate('/admin/residents/add')}} >+ Add Resident</button>
          </div>

          {error && <div className={styles.emptyRow}>{error}</div>}

          {isLoading ? <ResidentsSkeleton /> : (
          <>
          {/* Quick Stats */}
          <div className={styles.statsRow}>
            <div className={`${styles.statCard} ${styles.statTotal}`}>
              <span className={styles.statIcon}>👥</span>
              <span className={styles.statLabel}>Total Occupants</span>
              <span className={styles.statValue}>{counts.total}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statResidents}`}>
              <span className={styles.statIcon}>🏠</span>
              <span className={styles.statLabel}>Total Residents</span>
              <span className={styles.statValue}>{counts.residents}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statGuests}`}>
              <span className={styles.statIcon}>👤</span>
              <span className={styles.statLabel}>Total Guests</span>
              <span className={styles.statValue}>{counts.guests}</span>
            </div>
          </div>

          {/* Filters & Sorting */}
          <div className={styles.filterRow}>
            <select className={styles.filterSelect} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">Type (All)</option>
              <option value="Resident">Residents</option>
              <option value="Guest">Guests</option>
            </select>
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
                    <th className={styles.th}>NAME</th>
                    <th className={styles.th}>TYPE</th>
                    <th className={styles.th}>ROOM NO</th>
                    <th className={styles.th}>PHONE NUMBER</th>
                    <th className={styles.th}>JOINING DATE</th>
                    <th className={styles.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyRow}>No occupants found.</td>
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
                        <td className={styles.td}><TypeBadge type={r.type} /></td>
                        <td className={styles.td}>{r.room}</td>
                        <td className={styles.td}>{r.phone}</td>
                        <td className={styles.td}>{r.moveIn}</td>
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
              <div className={styles.emptyMobile}>No occupants found.</div>
            ) : (
              filtered.map((r) => <OccupantCard key={r.id} r={r} navigate={navigate} />)
            )}
          </div>
          </>
          )}

        </div>
      </main>

      <Popup 
        isOpen={popupConfig.isOpen}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
      />

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
