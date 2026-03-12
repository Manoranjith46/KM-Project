import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styles from "./AD_Kitchen.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Topbar from "./Components/Header/Topbar";
import { KitchenSkeleton } from "./Components/Skeleton/Skeleton";
import API from "../../API/axios";
import { useAuth } from "../../Context/AuthContext";

const MEAL_COLORS = { breakfast: "orange", lunch: "purple", dinner: "indigo" };

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
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [listType, setListType] = useState(null); // 'willing' or 'notWilling'

  const [isLoading, setIsLoading] = useState(true);
  const [menu, setMenu] = useState(null);
  const [participation, setParticipation] = useState({
    breakfast: { willing: [], notWilling: [] },
    lunch: { willing: [], notWilling: [] },
    dinner: { willing: [], notWilling: [] },
  });

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = DAYS[new Date().getDay()];

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, participationRes] = await Promise.allSettled([
        API.get(`/kitchen/menu?day=${todayDay}`),
        API.get('/kitchen/participation'),
      ]);
      if (menuRes.status === 'fulfilled') setMenu(menuRes.value.data);
      if (participationRes.status === 'fulfilled') setParticipation(participationRes.value.data);
    } catch (err) {
      console.error('Failed to fetch kitchen data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.IO – listen for real-time menu updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      query: { phoneNumber: user?.mobileNumber, role: user?.role },
      withCredentials: true,
    });

    socket.on('menu:updated', () => {
      fetchData();
    });

    socket.on('participation:updated', () => {
      fetchData();
    });

    return () => socket.disconnect();
  }, [user, fetchData]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Build meals array from API data
  const meals = menu ? ['breakfast', 'lunch', 'dinner'].map((key) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    time: menu[key]?.time || '—',
    color: MEAL_COLORS[key],
    items: menu[key]?.items || [],
  })) : [];

  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Floating Background Blobs (Matches Dashboard) ── */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* ══════════ SIDEBAR ══════════ */}
      <Sidebar currentPath={'kitchen'} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ══════════ MAIN WRAPPER ══════════ */}
      <main className={styles.mainContent}>

        {/* Top Bar */}
        <Topbar 
          title="Kitchen Management" 
          subtitle="Track meals, inventory, and feedback"
          currentView="kitchen"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* ── Section header ── */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Today's Menu &amp; Prep</h2>
            <p className={styles.sectionDate}>{today}</p>
          </div>
          <button className={styles.updateBtn} onClick={() => { navigate('/admin/kitchen/update') }} >+ Update Menu</button>
        </div>

        {isLoading ? <KitchenSkeleton /> : (
        <>
        {/* ── Meal service cards ── */}
        <div className={styles.mealGrid}>
          {meals.map((meal) => (
            <article key={meal.id} className={`${styles.mealCard} ${styles[`mealCard_${meal.color}`]}`}>
              <div className={styles.mealCardTop}>
                <div>
                  <h3 className={styles.mealLabel}>{meal.label}</h3>
                  <p className={styles.mealTime}>{meal.time}</p>
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

        {/* ── Meal Participation Section (Tomorrow) ── */}
        <div className={styles.sectionHeader} style={{ marginTop: '3rem' }}>
          <div>
            <h2 className={styles.sectionTitle}>Tomorrow's Meal Participation</h2>
            <p className={styles.sectionDate}>{tomorrow}</p>
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
                  <span className={styles.participationCount}>{participation.breakfast.willing.length}</span>
                  <span className={styles.participationText}>Willing</span>
                </div>
                <div className={styles.participationDivider} />
                <div className={styles.participationStat}>
                  <span className={styles.participationCountNot}>{participation.breakfast.notWilling.length}</span>
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
                  <span className={styles.participationCount}>{participation.lunch.willing.length}</span>
                  <span className={styles.participationText}>Willing</span>
                </div>
                <div className={styles.participationDivider} />
                <div className={styles.participationStat}>
                  <span className={styles.participationCountNot}>{participation.lunch.notWilling.length}</span>
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
                  <span className={styles.participationCount}>{participation.dinner.willing.length}</span>
                  <span className={styles.participationText}>Willing</span>
                </div>
                <div className={styles.participationDivider} />
                <div className={styles.participationStat}>
                  <span className={styles.participationCountNot}>{participation.dinner.notWilling.length}</span>
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
        </>
        )}
      </main>

      {/* ══════════ PARTICIPATION LIST MODAL ══════════ */}
      {showListModal && (
        <div className={styles.modalOverlay} onClick={() => setShowListModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {selectedMeal && `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`} — Participation
              </h3>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setShowListModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Willing / Not Willing toggle */}
            <div className={styles.modalTabs}>
              <button
                className={`${styles.modalTab} ${listType === 'willing' ? styles.modalTabActive : ''}`}
                onClick={() => setListType('willing')}
              >
                ✅ Willing ({selectedMeal ? participation[selectedMeal].willing.length : 0})
              </button>
              <button
                className={`${styles.modalTab} ${listType === 'notWilling' ? styles.modalTabActive : ''}`}
                onClick={() => setListType('notWilling')}
              >
                🚫 Not Willing ({selectedMeal ? participation[selectedMeal].notWilling.length : 0})
              </button>
            </div>


            <div className={styles.modalBody}>
              {selectedMeal ? (
                // Show list for selected meal
                <div className={styles.residentsList}>
                  {participation[selectedMeal][listType].length > 0 ? (
                    participation[selectedMeal][listType].map((resident) => (
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
                        {participation[meal][listType].length > 0 ? (
                          participation[meal][listType].map((resident) => (
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
    </div>
  );
}
