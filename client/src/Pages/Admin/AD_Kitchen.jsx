import { useState, useEffect } from "react";
import styles from "./AD_Kitchen.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";

/* ─── Static data ─── */
const MEALS = [
  {
    id: "breakfast",
    label: "Breakfast",
    time: "7:00 AM – 9:00 AM",
    servings: 42,
    color: "orange",
    items: ["Idli & Sambar", "Coconut Chutney", "Poha", "Tea / Coffee"],
  },
  {
    id: "lunch",
    label: "Lunch",
    time: "12:00 PM – 2:00 PM",
    servings: 45,
    color: "purple",
    items: ["Dal Tadka", "Jeera Rice", "Roti", "Mixed Veg Sabzi", "Salad"],
  },
  {
    id: "dinner",
    label: "Dinner",
    time: "7:00 PM – 9:00 PM",
    servings: 48,
    color: "indigo",
    items: ["Paneer Butter Masala", "Steamed Rice", "Roti", "Dal Makhani", "Sweet"],
  },
];

const INVENTORY = [
  { id: 1, item: "Rice", stock: "5 kg", status: "reorder" },
  { id: 2, item: "Sunflower Oil", stock: "2 L", status: "critical" },
  { id: 3, item: "Toor Dal", stock: "3 kg", status: "reorder" },
  { id: 4, item: "Onion", stock: "1 kg", status: "critical" },
  { id: 5, item: "Milk", stock: "8 L", status: "reorder" },
  { id: 6, item: "Tomato", stock: "4 kg", status: "reorder" },
];

const FEEDBACK = [
  { id: 1, initials: "RS", name: "Rahul Sharma", rating: 5, comment: "Breakfast was absolutely delicious today!", time: "9:10 AM" },
  { id: 2, initials: "PP", name: "Priya Patel", rating: 4, comment: "Lunch was good, could use more variety.", time: "2:30 PM" },
  { id: 3, initials: "AK", name: "Amit Kumar", rating: 3, comment: "Dinner okay, paneer was slightly cold.", time: "9:05 PM" },
  { id: 4, initials: "SR", name: "Sneha Reddy", rating: 5, comment: "Loved the coconut chutney at breakfast!", time: "8:55 AM" },
  { id: 5, initials: "VS", name: "Vikram Singh", rating: 4, comment: "Dal makhani was great at dinner.", time: "9:20 PM" },
];

function StarRating({ rating }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={s <= rating ? "#f59e0b" : "none"}
          stroke={s <= rating ? "#f59e0b" : "var(--border)"}
          strokeWidth="2"
          className={styles.star}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function Admin_Kitchen() {
  const [activeNav, setActiveNav] = useState("kitchen");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Floating Background Blobs (Matches Dashboard) ── */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* ══════════ SIDEBAR ══════════ */}
      <Sidebar currentPath={'kitchen'} />

      {/* ══════════ MAIN WRAPPER ══════════ */}
      <main className={styles.mainContent}>

        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Kitchen Management</h1>
              <p className={styles.pageSubtitle}>Track meals, inventory, and feedback</p>
            </div>
          </div>
        </header>

        {/* ── Section header ── */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Today's Menu &amp; Prep</h2>
            <p className={styles.sectionDate}>{today}</p>
          </div>
          <button className={styles.updateBtn}>+ Update Menu</button>
        </div>

        {/* ── Meal service cards ── */}
        <div className={styles.mealGrid}>
          {MEALS.map((meal) => (
            <article key={meal.id} className={`${styles.mealCard} ${styles[`mealCard_${meal.color}`]}`}>
              <div className={styles.mealCardTop}>
                <div>
                  <h3 className={styles.mealLabel}>{meal.label}</h3>
                  <p className={styles.mealTime}>{meal.time}</p>
                </div>
                <div className={styles.mealServingsBadge}>
                  <span className={styles.mealServingsNum}>{meal.servings}</span>
                  <span className={styles.mealServingsText}>Servings</span>
                </div>
              </div>
              <div className={styles.mealDivider} aria-hidden="true" />
              <ul className={styles.mealMenu} aria-label={`${meal.label} menu items`}>
                {meal.items.map((item) => (
                  <li key={item} className={styles.mealMenuItem}>
                    <span className={styles.mealMenuDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* ── Split layout ── */}
        <div className={styles.splitLayout}>

          {/* Left – Inventory */}
          <section className={styles.inventoryCard} aria-labelledby="inventory-title">
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle} id="inventory-title">Inventory Alerts</h3>
              <button className={styles.ghostBtn}>Order Supplies</button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.invTable}>
                <thead>
                  <tr>
                    <th className={styles.th}>Item Name</th>
                    <th className={styles.th}>Current Stock</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY.map((row) => (
                    <tr key={row.id} className={styles.tr}>
                      <td className={styles.td}>{row.item}</td>
                      <td className={styles.td}>{row.stock}</td>
                      <td className={styles.td}>
                        <span className={`${styles.statusPill} ${row.status === "critical" ? styles.pillCritical : styles.pillReorder}`}>
                          {row.status === "critical" ? "Critical" : "Reorder"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right – Feedback */}
          <section className={styles.feedbackCard} aria-labelledby="feedback-title">
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle} id="feedback-title">Recent Feedback</h3>
            </div>
            <ul className={styles.feedbackList}>
              {FEEDBACK.map((f) => (
                <li key={f.id} className={styles.feedbackItem}>
                  <div className={styles.feedbackAvatar}>{f.initials}</div>
                  <div className={styles.feedbackBody}>
                    <div className={styles.feedbackRow}>
                      <span className={styles.feedbackName}>{f.name}</span>
                      <StarRating rating={f.rating} />
                      <span className={styles.feedbackTime}>{f.time}</span>
                    </div>
                    <p className={styles.feedbackComment}>{f.comment}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

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
            <button className={`${styles.bottomNavItem} ${activeNav === 'kitchen' ? styles.active : ""}`} onClick={() => setActiveNav('kitchen')}>
                <span className={styles.bottomNavIcon}>🍽️</span>
                <span className={styles.bottomNavLabel}>Kitchen</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'more' ? styles.active : ""}`} onClick={() => setActiveNav('more')}>
                <span className={styles.bottomNavIcon}>⚙️</span>
                <span className={styles.bottomNavLabel}>More</span>
            </button>
        </nav>
      )}
    </div>
  );
}