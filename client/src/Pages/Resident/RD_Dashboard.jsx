import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import GateScanner from "./RD_Gate_Scanner";
import styles from "./RD_Dashboard.module.css";

export default function Resident_Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [user, setUser] = useState({
    name: "Mano",
    role: "Resident", 
    room: "A102",
    status: "IN HOSTEL", 
    totalSpendings: "₹45,500",
    dues: "₹2,500"
  });

  const [meals, setMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: false
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [scanAction, setScanAction] = useState("");

  const handleMealToggle = (mealType) => {
    if (user.status === "ON LEAVE") return; 
    setMeals((prev) => ({ ...prev, [mealType]: !prev[mealType] }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Call logout from AuthContext (handles API call, session clearing, and redirect)
    await logout();
  };

  const handleSuccessfulScan = (qrData) => {
    console.log("=== QR SCAN SUCCESSFUL ===");
    console.log("Received Data:", qrData);
    console.log("Data Type:", typeof qrData);
    
    // If JSON object was parsed
    if (typeof qrData === 'object' && qrData !== null) {
      console.log("📦 JSON Object Detected");
      console.log("JSON Keys:", Object.keys(qrData));
      console.log("Full JSON:", JSON.stringify(qrData, null, 2));
      
      // Extract specific fields if they exist
      if (qrData.gateId) console.log("Gate ID:", qrData.gateId);
      if (qrData.timestamp) console.log("Timestamp:", qrData.timestamp);
      if (qrData.location) console.log("Location:", qrData.location);
      if (qrData.type) console.log("Type:", qrData.type);
    } else {
      console.log("📝 Plain Text Data:", qrData);
    }
    
    console.log("========================");
    
    setIsScannerOpen(false); 
    
    // Flip the status
    const newStatus = user.status === "IN HOSTEL" ? "ON LEAVE" : "IN HOSTEL";
    const action = newStatus === "ON LEAVE" ? "Leaving" : "Entering";
    
    // Apply the update
    setUser((prev) => ({ ...prev, status: newStatus }));
    
    if (newStatus === "ON LEAVE") {
      setMeals({ breakfast: false, lunch: false, dinner: false }); // Auto-pause!
    }
    
    // Show success popup
    setScanAction(action);
    setShowSuccessPopup(true);
    
    // Auto-hide popup after 3 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>
      <div className={styles.hubContainer}>
        
        {/* HEADER SECTION (Full Width) */}
        <header className={styles.headerGlass}>
          <div className={styles.headerLeft}>
            <h1 className={styles.greeting}>Resident Dashboard</h1>
            <p className={styles.roleText}>Welcome back, {user.name}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>{user.name.charAt(0)}</div>
              <span className={styles.avatarName}>{user.name}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        {/* MAIN FULL-WIDTH GRID */}
        <div className={styles.mainGrid}>
          
          {/* 1. GATE PASS & STATUS CARD (Desktop: Column 1) */}
          <section className={`${styles.glassCard} ${user.status === "IN HOSTEL" ? styles.borderGreen : styles.borderRed}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Gate Status</h3>
              <span className={styles.roomBadge}>Room {user.room}</span>
            </div>
            
            <div className={styles.statusDisplay}>
              <h2 className={`${styles.statusText} ${user.status === "IN HOSTEL" ? styles.textGreen : styles.textRed}`}>
                {user.status === "IN HOSTEL" ? "🟢 IN HOSTEL" : "🔴 ON LEAVE"}
              </h2>
            </div>
            
            <button className={styles.qrButton} onClick={() => setIsScannerOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
              Scan QR at Gate
            </button>
          </section>

          {/* 2. TOTAL SPENDINGS (Desktop: Column 2) */}
          <section className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Spendings</h3>
              <span className={styles.badgeGreen}>Overall</span>
            </div>
            <div className={styles.financeDisplay}>
              <div className={styles.financeIcon}>💰</div>
              <div>
                <h2 className={styles.amountText}>{user.totalSpendings}</h2>
                <p className={styles.subText}>Since joining</p>
              </div>
            </div>
          </section>

          {/* 3. CURRENT DUES (Desktop: Column 3) */}
          <section className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Current Dues</h3>
              <span className={user.dues !== "₹0" ? styles.badgeRed : styles.badgeGreen}>
                {user.dues !== "₹0" ? "Pending" : "Cleared"}
              </span>
            </div>
            <div className={styles.financeDisplay}>
              <div className={styles.financeIcon}>🧾</div>
              <div>
                <h2 className={`${styles.amountText} ${user.dues !== "₹0" ? styles.textRed : styles.textGreen}`}>
                  {user.dues}
                </h2>
                <p className={styles.subText}>This Month</p>
              </div>
            </div>
            {user.dues !== "₹0" && (
              <button className={styles.payBtn} onClick={() => navigate('/resident/finance')} >Pay Rent</button>
            )}
          </section>

          {/* 4. MEAL TOGGLES (Desktop: Spans Columns 1 & 2) */}
          <section className={`${styles.glassCard} ${styles.mealsSection}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Am I Eating Tomorrow?</h3>
              {user.status === "ON LEAVE" && <span className={styles.badgeRed}>Auto-Paused</span>}
            </div>
            
            <div className={styles.mealGrid}>
              {/* Breakfast */}
              <div className={`${styles.mealRow} ${user.status === "ON LEAVE" ? styles.mealDisabled : ""}`} onClick={() => handleMealToggle("breakfast")}>
                <div className={styles.mealInfoBox}>
                  <span className={styles.mealIcon}>🥞</span>
                  <div className={styles.mealText}>
                    <p>Breakfast</p>
                    <small>Cut-off: 3:30 AM</small>
                  </div>
                </div>
                <div className={`${styles.toggleSwitch} ${meals.breakfast && user.status === "IN HOSTEL" ? styles.toggleOn : ""}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>

              {/* Lunch */}
              <div className={`${styles.mealRow} ${user.status === "ON LEAVE" ? styles.mealDisabled : ""}`} onClick={() => handleMealToggle("lunch")}>
                <div className={styles.mealInfoBox}>
                  <span className={styles.mealIcon}>🍛</span>
                  <div className={styles.mealText}>
                    <p>Lunch</p>
                    <small>Cut-off: 3:30 AM</small>
                  </div>
                </div>
                <div className={`${styles.toggleSwitch} ${meals.lunch && user.status === "IN HOSTEL" ? styles.toggleOn : ""}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>

              {/* Dinner */}
              <div className={`${styles.mealRow} ${user.status === "ON LEAVE" ? styles.mealDisabled : ""}`} onClick={() => handleMealToggle("dinner")}>
                <div className={styles.mealInfoBox}>
                  <span className={styles.mealIcon}>🍲</span>
                  <div className={styles.mealText}>
                    <p>Dinner</p>
                    <small>Cut-off: 3:30 PM</small>
                  </div>
                </div>
                <div className={`${styles.toggleSwitch} ${meals.dinner && user.status === "IN HOSTEL" ? styles.toggleOn : ""}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. SERVICES ACTIONS (Desktop: Column 3) */}
          <section className={`${styles.glassCard} ${styles.servicesSection}`}>
            <h3 className={styles.cardTitle}>Quick Services</h3>
            <div className={styles.actionGrid}>
              <button className={styles.actionCard} onClick={() => navigate('/resident/report')} >
                <div className={styles.actionIcon}>🛠️</div>
                <span>Report Issue</span>
              </button>
              <button className={styles.actionCard} onClick={() => navigate('/resident/notice')} >
                <div className={styles.actionIcon}>📢</div>
                <span>Notice Board</span>
              </button>
            </div>
          </section>

        </div> {/* End of Main Grid */}
      </div>

      <GateScanner
        isOpen={isScannerOpen}
        currentStatus={user.status}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleSuccessfulScan}
      />

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
    </div>
  );
}