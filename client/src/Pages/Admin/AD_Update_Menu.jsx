import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AD_Update_Menu.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";

export default function Admin_UpdateMenu() {
  const navigate = useNavigate(); 
  
  const [activeNav, setActiveNav] = useState("kitchen");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Today's date formatted for the date input default
  const todayDate = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    menuDate: todayDate,
    breakfastTime: "07:00 AM - 09:00 AM",
    breakfastItems: "Idli & Sambar\nCoconut Chutney\nPoha\nTea / Coffee",
    lunchTime: "12:00 PM - 02:00 PM",
    lunchItems: "Dal Tadka\nJeera Rice\nRoti\nMixed Veg Sabzi\nSalad",
    dinnerTime: "07:00 PM - 09:00 PM",
    dinnerItems: "Paneer Butter Masala\nSteamed Rice\nRoti\nDal Makhani\nSweet",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoBack = () => {
    navigate('/admin/kitchen');
  };

  return (
    <div className={styles.dashboardWrapper}>
      {/* Floating Background Blobs */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath={"kitchen"} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        
        {/* Top Nav */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.backBtn} onClick={handleGoBack} aria-label="Go Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Update Daily Menu</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.formContainer}>
            
            <div className={styles.formHeaderRow}>
              <div className={styles.fieldGroupDate}>
                <label className={styles.label} htmlFor="menuDate">Select Date</label>
                <input 
                  id="menuDate" 
                  name="menuDate" 
                  type="date" 
                  className={styles.input} 
                  value={form.menuDate} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <hr className={styles.mainDivider} />

            {/* 1. Breakfast Section */}
            <section className={`${styles.mealSection} ${styles.mealOrange}`}>
              <div className={styles.mealHeader}>
                <h3 className={styles.mealTitle}>Breakfast</h3>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="breakfastTime">Service Timings</label>
                  <input id="breakfastTime" name="breakfastTime" className={styles.input} value={form.breakfastTime} onChange={handleChange} />
                </div>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="breakfastItems">Menu Items <span className={styles.labelSub}>(Enter one item per line)</span></label>
                  <textarea 
                    id="breakfastItems" 
                    name="breakfastItems" 
                    className={`${styles.input} ${styles.textarea}`} 
                    value={form.breakfastItems} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </section>

            {/* 2. Lunch Section */}
            <section className={`${styles.mealSection} ${styles.mealPurple}`}>
              <div className={styles.mealHeader}>
                <h3 className={styles.mealTitle}>Lunch</h3>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="lunchTime">Service Timings</label>
                  <input id="lunchTime" name="lunchTime" className={styles.input} value={form.lunchTime} onChange={handleChange} />
                </div>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="lunchItems">Menu Items <span className={styles.labelSub}>(Enter one item per line)</span></label>
                  <textarea 
                    id="lunchItems" 
                    name="lunchItems" 
                    className={`${styles.input} ${styles.textarea}`} 
                    value={form.lunchItems} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </section>

            {/* 3. Dinner Section */}
            <section className={`${styles.mealSection} ${styles.mealIndigo}`}>
              <div className={styles.mealHeader}>
                <h3 className={styles.mealTitle}>Dinner</h3>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="dinnerTime">Service Timings</label>
                  <input id="dinnerTime" name="dinnerTime" className={styles.input} value={form.dinnerTime} onChange={handleChange} />
                </div>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="dinnerItems">Menu Items <span className={styles.labelSub}>(Enter one item per line)</span></label>
                  <textarea 
                    id="dinnerItems" 
                    name="dinnerItems" 
                    className={`${styles.input} ${styles.textarea}`} 
                    value={form.dinnerItems} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className={styles.formFooter}>
              <div className={styles.footerActions}>
                <button className={styles.cancelBtn} onClick={handleGoBack}>Cancel</button>
                <button className={styles.saveBtn}>Publish Menu</button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Nav (mobile <=768px) */}
      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
            <button className={`${styles.bottomNavItem} ${activeNav === 'dashboard' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('dashboard')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Dashboard</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'residents' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('residents')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Residents</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'kitchen' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('kitchen')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Kitchen</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'more' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('more')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>More</span>
            </button>
        </nav>
      )}
    </div>
  );
}
