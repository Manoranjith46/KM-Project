import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AD_Update_Menu.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Loader from "../Resident/Components/Loader/Loader";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";
import useBlockInteraction from "../../hooks/useBlockInteraction";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Admin_UpdateMenu() {
  const navigate = useNavigate(); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useBlockInteraction(isSubmitting);

  const todayDay = DAYS[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(todayDay);

  // Per-day form state: { Sunday: { breakfastTime, breakfastItems, ... }, ... }
  const emptyForm = { breakfastTime: "", breakfastItems: "", lunchTime: "", lunchItems: "", dinnerTime: "", dinnerItems: "" };
  const [weekForms, setWeekForms] = useState(
    Object.fromEntries(DAYS.map((d) => [d, { ...emptyForm }]))
  );
  const [loaded, setLoaded] = useState(false);


  // Fetch all 7 days on mount
  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const { data } = await API.get('/kitchen/menu/week');
        const forms = {};
        for (const menu of data) {
          forms[menu.day] = {
            breakfastTime: menu.breakfast?.time || "",
            breakfastItems: (menu.breakfast?.items || []).join("\n"),
            lunchTime: menu.lunch?.time || "",
            lunchItems: (menu.lunch?.items || []).join("\n"),
            dinnerTime: menu.dinner?.time || "",
            dinnerItems: (menu.dinner?.items || []).join("\n"),
          };
        }
        setWeekForms((prev) => ({ ...prev, ...forms }));
      } catch (err) {
        console.error("Failed to fetch week menu", err);
      } finally {
        setLoaded(true);
      }
    };
    fetchWeek();
  }, []);

  const form = weekForms[selectedDay];

  const handleChange = (e) => {
    setWeekForms((prev) => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], [e.target.name]: e.target.value },
    }));
  };

  const handleGoBack = () => {
    navigate('/admin/kitchen');
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const toItems = (str) => str.split("\n").map((s) => s.trim()).filter(Boolean);

      await minDelay(API.put("/kitchen/menu", {
        day: selectedDay,
        breakfast: { time: form.breakfastTime, items: toItems(form.breakfastItems) },
        lunch: { time: form.lunchTime, items: toItems(form.lunchItems) },
        dinner: { time: form.dinnerTime, items: toItems(form.dinnerItems) },
      }));

      navigate("/admin/kitchen");
    } catch (err) {
      console.error("Failed to publish menu", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      {/* Floating Background Blobs */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath={"kitchen"} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
              <div className={styles.dayTabsContainer}>
                {DAYS.map((day) => (
                  <button
                    key={day}
                    className={`${styles.dayTab} ${selectedDay === day ? styles.dayTabActive : ''} ${day === todayDay ? styles.dayTabToday : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className={styles.dayTabShort}>{day.slice(0, 3)}</span>
                    <span className={styles.dayTabFull}>{day}</span>
                  </button>
                ))}
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
                <button className={styles.saveBtn} onClick={handlePublish} disabled={isSubmitting}>Publish Menu</button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ══════════ LOADER OVERLAY ══════════ */}
      {isSubmitting && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Publishing..." />
          </div>
        </div>
      )}

    </div>
  );
}
