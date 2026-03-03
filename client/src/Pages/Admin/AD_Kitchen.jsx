import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AD_Kitchen.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Topbar from "./Components/Header/Topbar";

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

const FEEDBACK = [
  { id: 1, initials: "RS", name: "Rahul Sharma", rating: 5, comment: "Breakfast was absolutely delicious today!", time: "9:10 AM" },
  { id: 2, initials: "PP", name: "Priya Patel", rating: 4, comment: "Lunch was good, could use more variety.", time: "2:30 PM" },
  { id: 3, initials: "AK", name: "Amit Kumar", rating: 3, comment: "Dinner okay, paneer was slightly cold.", time: "9:05 PM" },
  { id: 4, initials: "SR", name: "Sneha Reddy", rating: 5, comment: "Loved the coconut chutney at breakfast!", time: "8:55 AM" },
  { id: 5, initials: "VS", name: "Vikram Singh", rating: 4, comment: "Dal makhani was great at dinner.", time: "9:20 PM" },
];

// Meal participation data
const MEAL_PARTICIPATION = {
  breakfast: {
    willing: [
      { id: 1, name: "Rahul Sharma", room: "101", initials: "RS" },
      { id: 2, name: "Priya Patel", room: "205", initials: "PP" },
      { id: 3, name: "Amit Kumar", room: "312", initials: "AK" },
      { id: 4, name: "Sneha Reddy", room: "108", initials: "SR" },
      { id: 5, name: "Vikram Singh", room: "201", initials: "VS" },
      { id: 6, name: "Anita Desai", room: "305", initials: "AD" },
      { id: 7, name: "Rajesh Kumar", room: "110", initials: "RK" },
      { id: 8, name: "Meena Iyer", room: "315", initials: "MI" },
    ],
    notWilling: [
      { id: 9, name: "Karan Mehta", room: "407", initials: "KM" },
      { id: 10, name: "Deepa Nair", room: "502", initials: "DN" },
    ],
  },
  lunch: {
    willing: [
      { id: 1, name: "Rahul Sharma", room: "101", initials: "RS" },
      { id: 2, name: "Priya Patel", room: "205", initials: "PP" },
      { id: 3, name: "Amit Kumar", room: "312", initials: "AK" },
      { id: 4, name: "Sneha Reddy", room: "108", initials: "SR" },
      { id: 5, name: "Vikram Singh", room: "201", initials: "VS" },
      { id: 6, name: "Anita Desai", room: "305", initials: "AD" },
      { id: 7, name: "Rajesh Kumar", room: "110", initials: "RK" },
      { id: 8, name: "Meena Iyer", room: "315", initials: "MI" },
      { id: 9, name: "Karan Mehta", room: "407", initials: "KM" },
    ],
    notWilling: [
      { id: 10, name: "Deepa Nair", room: "502", initials: "DN" },
    ],
  },
  dinner: {
    willing: [
      { id: 1, name: "Rahul Sharma", room: "101", initials: "RS" },
      { id: 2, name: "Priya Patel", room: "205", initials: "PP" },
      { id: 3, name: "Amit Kumar", room: "312", initials: "AK" },
      { id: 4, name: "Sneha Reddy", room: "108", initials: "SR" },
      { id: 5, name: "Vikram Singh", room: "201", initials: "VS" },
      { id: 6, name: "Anita Desai", room: "305", initials: "AD" },
      { id: 7, name: "Rajesh Kumar", room: "110", initials: "RK" },
      { id: 8, name: "Meena Iyer", room: "315", initials: "MI" },
      { id: 9, name: "Karan Mehta", room: "407", initials: "KM" },
      { id: 10, name: "Deepa Nair", room: "502", initials: "DN" },
    ],
    notWilling: [],
  },
};

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

  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("kitchen");
  const [isMobile, setIsMobile] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [listType, setListType] = useState(null); // 'willing' or 'notWilling'

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
        <Topbar 
          title="Kitchen Management" 
          subtitle="Track meals, inventory, and feedback"
          currentView="kitchen"
        />

        {/* ── Section header ── */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Today's Menu &amp; Prep</h2>
            <p className={styles.sectionDate}>{today}</p>
          </div>
          <button className={styles.updateBtn} onClick={() => { navigate('/admin/kitchen/update') }} >+ Update Menu</button>
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

        {/* ── Meal Participation Section ── */}
        <div className={styles.sectionHeader} style={{ marginTop: '3rem' }}>
          <div>
            <h2 className={styles.sectionTitle}>Meal Participation</h2>
            <p className={styles.sectionDate}>Who's eating today?</p>
          </div>
        </div>

        {/* ── Participation cards ── */}
        <div className={styles.participationGrid}>
          <article className={`${styles.participationCard} ${styles.participationCard_breakfast}`}>
            <div className={styles.participationIcon}>🌅</div>
            <div className={styles.participationContent}>
              <h3 className={styles.participationLabel}>Breakfast</h3>
              <div className={styles.participationStats}>
                <div className={styles.participationStat}>
                  <span className={styles.participationCount}>{MEAL_PARTICIPATION.breakfast.willing.length}</span>
                  <span className={styles.participationText}>Willing</span>
                </div>
                <div className={styles.participationDivider} />
                <div className={styles.participationStat}>
                  <span className={styles.participationCountNot}>{MEAL_PARTICIPATION.breakfast.notWilling.length}</span>
                  <span className={styles.participationText}>Not Willing</span>
                </div>
              </div>
              <button 
                className={styles.participationDetailBtn}
                onClick={() => {
                  setSelectedMeal('breakfast');
                  setListType('willing');
                  setShowListModal(true);
                }}
              >
                View Details →
              </button>
            </div>
          </article>

          <article className={`${styles.participationCard} ${styles.participationCard_lunch}`}>
            <div className={styles.participationIcon}>🍱</div>
            <div className={styles.participationContent}>
              <h3 className={styles.participationLabel}>Lunch</h3>
              <div className={styles.participationStats}>
                <div className={styles.participationStat}>
                  <span className={styles.participationCount}>{MEAL_PARTICIPATION.lunch.willing.length}</span>
                  <span className={styles.participationText}>Willing</span>
                </div>
                <div className={styles.participationDivider} />
                <div className={styles.participationStat}>
                  <span className={styles.participationCountNot}>{MEAL_PARTICIPATION.lunch.notWilling.length}</span>
                  <span className={styles.participationText}>Not Willing</span>
                </div>
              </div>
              <button 
                className={styles.participationDetailBtn}
                onClick={() => {
                  setSelectedMeal('lunch');
                  setListType('willing');
                  setShowListModal(true);
                }}
              >
                View Details →
              </button>
            </div>
          </article>

          <article className={`${styles.participationCard} ${styles.participationCard_dinner}`}>
            <div className={styles.participationIcon}>🌙</div>
            <div className={styles.participationContent}>
              <h3 className={styles.participationLabel}>Dinner</h3>
              <div className={styles.participationStats}>
                <div className={styles.participationStat}>
                  <span className={styles.participationCount}>{MEAL_PARTICIPATION.dinner.willing.length}</span>
                  <span className={styles.participationText}>Willing</span>
                </div>
                <div className={styles.participationDivider} />
                <div className={styles.participationStat}>
                  <span className={styles.participationCountNot}>{MEAL_PARTICIPATION.dinner.notWilling.length}</span>
                  <span className={styles.participationText}>Not Willing</span>
                </div>
              </div>
              <button 
                className={styles.participationDetailBtn}
                onClick={() => {
                  setSelectedMeal('dinner');
                  setListType('willing');
                  setShowListModal(true);
                }}
              >
                View Details →
              </button>
            </div>
          </article>
        </div>
      </main>

      {/* ══════════ PARTICIPATION LIST MODAL ══════════ */}
      {showListModal && (
        <div className={styles.modalOverlay} onClick={() => setShowListModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {listType === 'willing' ? '✅ Willing to Eat' : '🚫 Not Willing to Eat'}
                {selectedMeal && ` - ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`}
              </h3>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setShowListModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>


            <div className={styles.modalBody}>
              {selectedMeal ? (
                // Show list for selected meal
                <div className={styles.residentsList}>
                  {MEAL_PARTICIPATION[selectedMeal][listType].length > 0 ? (
                    MEAL_PARTICIPATION[selectedMeal][listType].map((resident) => (
                      <div key={resident.id} className={styles.residentItem}>
                        <div className={styles.residentAvatar}>{resident.initials}</div>
                        <div className={styles.residentInfo}>
                          <span className={styles.residentName}>{resident.name}</span>
                          <span className={styles.residentRoom}>Room {resident.room}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>📭</span>
                      <p className={styles.emptyText}>No residents in this category</p>
                    </div>
                  )}
                </div>
              ) : (
                // Show lists for all meals
                <div className={styles.allMealsView}>
                  {['breakfast', 'lunch', 'dinner'].map((meal) => (
                    <div key={meal} className={styles.mealSection}>
                      <h4 className={styles.mealSectionTitle}>
                        {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '🍱' : '🌙'} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </h4>
                      <div className={styles.residentsList}>
                        {MEAL_PARTICIPATION[meal][listType].length > 0 ? (
                          MEAL_PARTICIPATION[meal][listType].map((resident) => (
                            <div key={resident.id} className={styles.residentItem}>
                              <div className={styles.residentAvatar}>{resident.initials}</div>
                              <div className={styles.residentInfo}>
                                <span className={styles.residentName}>{resident.name}</span>
                                <span className={styles.residentRoom}>Room {resident.room}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={styles.noResidents}>No residents</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCloseFooterBtn}
                onClick={() => setShowListModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
