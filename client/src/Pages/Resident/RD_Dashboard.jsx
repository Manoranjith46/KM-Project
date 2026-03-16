import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";
import useSocket from "../../hooks/useSocket";
import Loader from "./Components/Loader/Loader";
import { DashboardSkeleton } from "./Components/Skeleton/Skeleton";
import Popup from './Components/popup/Popup';
import useBlockInteraction from '../../hooks/useBlockInteraction';
import styles from "./RD_Dashboard.module.css";

export default function Resident_Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isGuest = user?.role === 'guest';
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [resident, setResident] = useState({
    name: user?.name || "",
    role: "Resident",
    room: "",
    status: "IN HOSTEL", 
    totalSpendings: "₹0",
    dues: "₹0"
  });

  const [meals, setMeals] = useState({});
  const [tomorrowMenu, setTomorrowMenu] = useState(null);
  const socketRef = useSocket(user?.mobileNumber);
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });

  const showError = useCallback((title, message) => {
    setPopup({
      isOpen: true,
      type: 'error',
      title,
      message
    });
  }, []);

  const fetchResidentProfile = useCallback(async () => {
    if (!user?.mobileNumber) return;
    try {
      const res = await API.get(`/residents/${user.mobileNumber}`);
      const data = res.data;
      setResident((prev) => ({
        ...prev,
        name: data.name,
        room: data.roomNumber,
        status: data.isActive ? "IN HOSTEL" : "ON LEAVE",
      }));
      setMeals(data.dailyMeals || {});
    } catch (err) {
      console.error("Error fetching resident profile:", err);
      showError('Profile Load Failed', err.response?.data?.message || 'Could not load your profile. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [showError, user?.mobileNumber]);

  const fetchFinanceSummary = useCallback(async () => {
    if (!user?.mobileNumber) {
      return;
    }

    try {
      const [paymentsRes, duesRes] = await Promise.all([
        API.get(`/payments/${user.mobileNumber}`),
        API.get(`/payments/dues/${user.mobileNumber}`),
      ]);

      let payments = [];
      if (paymentsRes?.data && Array.isArray(paymentsRes.data)) {
        payments = paymentsRes.data;
      } else if (paymentsRes?.data?.payments && Array.isArray(paymentsRes.data.payments)) {
        payments = paymentsRes.data.payments;
      }

      const totalApproved = payments.reduce((sum, payment) => {
        const isApproved = String(payment?.status || "").toLowerCase() === "approved";
        const amount = Number(payment?.amount) || 0;
        return isApproved ? sum + amount : sum;
      }, 0);

      const dueAmount = Number(duesRes?.data?.dueAmount) || 0;

      setResident((prev) => ({
        ...prev,
        totalSpendings: `₹${totalApproved.toLocaleString("en-IN")}`,
        dues: `₹${dueAmount.toLocaleString("en-IN")}`,
      }));
    } catch (err) {
      console.error("Error fetching finance summary:", err);
      showError('Finance Load Failed', err.response?.data?.message || 'Could not load finance summary right now.');
    }
  }, [showError, user?.mobileNumber]);

  useEffect(() => {
    fetchResidentProfile();
  }, [fetchResidentProfile]);

  useEffect(() => {
    fetchFinanceSummary();
  }, [fetchFinanceSummary]);

  // Fetch tomorrow's menu
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const tomorrowDay = DAYS[(new Date().getDay() + 1) % 7];

  const fetchTomorrowMenu = useCallback(async () => {
    try {
      const { data } = await API.get(`/kitchen/menu?day=${tomorrowDay}`);
      setTomorrowMenu(data);
    } catch (err) {
      console.error("Error fetching tomorrow menu:", err);
      showError('Menu Load Failed', err.response?.data?.message || 'Could not load tomorrow menu. Please try again later.');
    }
  }, [showError, tomorrowDay]);

  useEffect(() => {
    fetchTomorrowMenu();
  }, [fetchTomorrowMenu]);

  // Socket.IO real-time listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onGateUpdated = ({ isActive, dailyMeals }) => {
      setResident((prev) => ({
        ...prev,
        status: isActive ? "IN HOSTEL" : "ON LEAVE",
      }));
      setMeals(dailyMeals);
    };

    const onMealsUpdated = (updatedMeals) => {
      setMeals(updatedMeals);
    };

    const onPaymentUpdated = () => {
      fetchFinanceSummary();
    };

    socket.on('resident:gate-updated', onGateUpdated);
    socket.on('resident:meals-updated', onMealsUpdated);
    socket.on('resident:payment-updated', onPaymentUpdated);
    socket.on('menu:updated', fetchTomorrowMenu);

    return () => {
      socket.off('resident:gate-updated', onGateUpdated);
      socket.off('resident:meals-updated', onMealsUpdated);
      socket.off('resident:payment-updated', onPaymentUpdated);
      socket.off('menu:updated', fetchTomorrowMenu);
    };
  }, [socketRef, fetchFinanceSummary, fetchTomorrowMenu]);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [scanAction, setScanAction] = useState("");
  const [isUpdatingMeal, setIsUpdatingMeal] = useState(false);
  const [isTogglingGate, setIsTogglingGate] = useState(false);
  useBlockInteraction(isTogglingGate);

  const handleMealToggle = async (mealType) => {
    if (isUpdatingMeal) return;
    if (resident.status === "ON LEAVE") return;
    
    if (!user?.mobileNumber) {
      console.error("User not authenticated");
      showError('Session Error', 'Please log in again to update meal preference.');
      return;
    }

    try {
      setIsUpdatingMeal(true);
      const res = await minDelay(API.put('/food/toggle', {
        phoneNumber: user.mobileNumber,
        mealType
      }));
      setMeals(res.data.currentStatus);
    } catch (err) {
      console.error("Error updating meal preference:", err);
      showError('Meal Update Failed', err.response?.data?.message || 'Could not update meal preference. Please try again.');
    } finally {
      setIsUpdatingMeal(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Call logout from AuthContext (handles API call, session clearing, and redirect)
    await logout();
  };

  const handleGateToggle = async () => {
    if (isTogglingGate || !user?.mobileNumber) return;
    try {
      setIsTogglingGate(true);
      const res = await minDelay(API.put(`/residents/gate-toggle/${user.mobileNumber}`));
      const { isActive, dailyMeals } = res.data;

      const newStatus = isActive ? "IN HOSTEL" : "ON LEAVE";
      const action = isActive ? "Entering" : "Leaving";

      setResident((prev) => ({ ...prev, status: newStatus }));
      setMeals(dailyMeals);

      setScanAction(action);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 1500);
    } catch (err) {
      console.error("Error toggling gate status:", err);
      showError('Gate Update Failed', err.response?.data?.message || 'Could not update gate status. Please try again.');
    } finally {
      setIsTogglingGate(false);
    }
  };

  return (
    <div className={`${styles.dashboardWrapper} ${isGuest ? styles.dashboardWrapperGuest : ''}`}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest1 : styles.blob1}`}></div>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest2 : styles.blob2}`}></div>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest3 : styles.blob3}`}></div>
      </div>
      <div className={styles.hubContainer}>
        
        {isLoading ? <DashboardSkeleton isGuest={isGuest} /> : (<>
        {/* HEADER SECTION (Full Width) */}
        <header className={styles.headerGlass}>
          <div className={styles.headerLeft}>
            <h1 className={styles.greeting}>{isGuest ? 'Guest Dashboard' : 'Resident Dashboard'}</h1>
            <p className={styles.roleText}>Welcome back, {resident.name}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.avatarContainer}>
              <div className={`${styles.avatar} ${isGuest ? styles.avatarGuest : ''}`}>{resident.name.charAt(0)}</div>
              <span className={styles.avatarName}>{resident.name}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        {/* MAIN FULL-WIDTH GRID */}
        <div className={styles.mainGrid}>
          
          {/* 1. GATE PASS & STATUS CARD (Desktop: Column 1) */}
          <section className={`${styles.glassCard} ${resident.status === "IN HOSTEL" ? (isGuest ? styles.borderGuestGreen : styles.borderGreen) : styles.borderRed}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Gate Status</h3>
              <span className={styles.roomBadge}>Room {resident.room}</span>
            </div>
            
            <div className={styles.statusDisplay}>
              <h2 className={`${styles.statusText} ${resident.status === "IN HOSTEL" ? styles.textGreen : styles.textRed}`}>
                {resident.status === "IN HOSTEL" ? "🟢 IN HOSTEL" : "🔴 ON LEAVE"}
              </h2>
            </div>

            <button className={`${styles.qrButton} ${isGuest ? styles.qrButtonGuest : ''}`} onClick={handleGateToggle} disabled={isTogglingGate}>
              {isTogglingGate ? "Updating..." : resident.status === "IN HOSTEL" ? "Mark OUT" : "Mark IN"}
            </button>
          </section>

          {/* 2. TOTAL SPENDINGS (Desktop: Column 2) */}
          <section className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Spendings</h3>
              <span className={isGuest ? styles.badgeRed : styles.badgeGreen}>Overall</span>
            </div>
            <div className={styles.financeDisplay}>
              <div className={styles.financeIcon}>💰</div>
              <div>
                <h2 className={styles.amountText}>{resident.totalSpendings}</h2>
                <p className={styles.subText}>Since joining</p>
              </div>
            </div>
          </section>

          {/* 3. CURRENT DUES (Desktop: Column 3) */}
          <section className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Current Dues</h3>
              <span className={resident.dues !== "₹0" ? styles.badgeRed : styles.badgeGreen}>
                {resident.dues !== "₹0" ? "Pending" : "Cleared"}
              </span>
            </div>
            <div className={styles.financeDisplay}>
              <div className={styles.financeIcon}>🧾</div>
              <div>
                <h2 className={`${styles.amountText} ${resident.dues !== "₹0" ? styles.textRed : styles.textGreen}`}>
                  {resident.dues}
                </h2>
                <p className={styles.subText}>This Month</p>
              </div>
            </div>
            {resident.dues !== "₹0" && (
              <button className={`${styles.payBtn} ${isGuest ? styles.payBtnGuest : ''}`} onClick={() => navigate('/resident/finance')} >Pay Rent</button>
            )}
          </section>

          {/* 4. MEAL TOGGLES (Desktop: Spans Columns 1 & 2) */}
          <section className={`${styles.glassCard} ${styles.mealsSection}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Am I Eating Tomorrow?</h3>
              {resident.status === "ON LEAVE" && <span className={styles.badgeRed}>Auto-Paused</span>}
            </div>
            
            <div className={styles.mealGrid}>
              {/* Breakfast */}
              <div className={styles.mealRow}>
                <div className={styles.mealInfoBox}>
                  <span className={`${styles.mealIcon} ${isGuest ? styles.mealIconGuest : ''}`}>🥞</span>
                  <div className={styles.mealText}>
                    <p>Breakfast</p>
                    <small>Cut-off: 3:30 AM</small>
                  </div>
                </div>
                <button
                  className={`${styles.toggleSwitch} ${meals.breakfast && resident.status === "IN HOSTEL" ? (isGuest ? styles.toggleOnGuest : styles.toggleOn) : ""}`}
                  onClick={() => handleMealToggle("breakfast")}
                  disabled={resident.status === "ON LEAVE" || isUpdatingMeal}
                >
                  <span className={styles.toggleKnob}></span>
                </button>
              </div>

              {/* Lunch */}
              <div className={styles.mealRow}>
                <div className={styles.mealInfoBox}>
                  <span className={`${styles.mealIcon} ${isGuest ? styles.mealIconGuest : ''}`}>🍛</span>
                  <div className={styles.mealText}>
                    <p>Lunch</p>
                    <small>Cut-off: 3:30 AM</small>
                  </div>
                </div>
                <button
                  className={`${styles.toggleSwitch} ${meals.lunch && resident.status === "IN HOSTEL" ? (isGuest ? styles.toggleOnGuest : styles.toggleOn) : ""}`}
                  onClick={() => handleMealToggle("lunch")}
                  disabled={resident.status === "ON LEAVE" || isUpdatingMeal}
                >
                  <span className={styles.toggleKnob}></span>
                </button>
              </div>

              {/* Dinner */}
              <div className={styles.mealRow}>
                <div className={styles.mealInfoBox}>
                  <span className={`${styles.mealIcon} ${isGuest ? styles.mealIconGuest : ''}`}>🍲</span>
                  <div className={styles.mealText}>
                    <p>Dinner</p>
                    <small>Cut-off: 3:30 PM</small>
                  </div>
                </div>
                <button
                  className={`${styles.toggleSwitch} ${meals.dinner && resident.status === "IN HOSTEL" ? (isGuest ? styles.toggleOnGuest : styles.toggleOn) : ""}`}
                  onClick={() => handleMealToggle("dinner")}
                  disabled={resident.status === "ON LEAVE" || isUpdatingMeal}
                >
                  <span className={styles.toggleKnob}></span>
                </button>
              </div>
            </div>
          </section>

          {/* 5. SERVICES ACTIONS (Desktop: Column 3) */}
          <section className={`${styles.glassCard} ${styles.servicesSection}`}>
            <h3 className={styles.cardTitle}>Quick Services</h3>
            <div className={styles.actionGrid}>
              <button className={`${styles.actionCard} ${isGuest ? styles.actionCardGuest : ''}`} onClick={() => navigate('/resident/report')} >
                <div className={`${styles.actionIcon} ${isGuest ? styles.actionIconGuest : ''}`}>🛠️</div>
                <span>Report Issue</span>
              </button>
              <button className={`${styles.actionCard} ${isGuest ? styles.actionCardGuest : ''}`} onClick={() => navigate('/resident/notice')} >
                <div className={`${styles.actionIcon} ${isGuest ? styles.actionIconGuest : ''}`}>📢</div>
                <span>Notice Board</span>
              </button>
            </div>
          </section>

          {/* 6. TOMORROW'S MENU (Full width) */}
          {tomorrowMenu && (
            <section className={`${styles.glassCard} ${styles.tomorrowMenuSection}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Tomorrow's Menu</h3>
                <span className={isGuest ? styles.badgeRed : styles.badgeGreen}>{tomorrowDay}</span>
              </div>
              <div className={styles.tomorrowMenuGrid}>
                {[
                  { key: 'breakfast', label: 'Breakfast', icon: '🥞' },
                  { key: 'lunch', label: 'Lunch', icon: '🍛' },
                  { key: 'dinner', label: 'Dinner', icon: '🍲' },
                ].map((meal) => {
                  const mealData = tomorrowMenu[meal.key];
                  const hasItems = mealData?.items?.length > 0;
                  return (
                    <div key={meal.key} className={styles.tomorrowMealCard}>
                      <div className={styles.tomorrowMealHeader}>
                        <span className={`${styles.tomorrowMealIcon} ${isGuest ? styles.tomorrowMealIconGuest : ''}`}>{meal.icon}</span>
                        <div>
                          <p className={styles.tomorrowMealLabel}>{meal.label}</p>
                          {mealData?.time && <small className={styles.tomorrowMealTime}>{mealData.time}</small>}
                        </div>
                      </div>
                      {hasItems ? (
                        <ul className={styles.tomorrowMealItems}>
                          {mealData.items.map((item, i) => (
                            <li key={i} className={styles.tomorrowMealItem}>
                              <span className={`${styles.tomorrowMealDot} ${isGuest ? styles.tomorrowMealDotGuest : ''}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.tomorrowMealEmpty}>Menu not set yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div> {/* End of Main Grid */}
        </>)}
      </div>
      {isTogglingGate && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Updating..." />
          </div>
        </div>
      )}

      {isUpdatingMeal && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Updating..." />
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className={styles.successOverlay}>
          <div className={styles.successPopup}>
            <div className={styles.successIcon}>
              {scanAction === "Entering" ? "🏠" : "👋"}
            </div>
            <h2 className={styles.successTitle}>{scanAction}!</h2>
            <p className={styles.successMessage}>
              {scanAction === "Entering" 
                ? "Welcome back to the hostel" 
                : "Have a safe journey"}
            </p>
            <div className={styles.successCheckmark}>✓</div>
          </div>
        </div>
      )}

      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        type={popup.type}
        title={popup.title}
        message={popup.message}
      />
    </div>
  );
}