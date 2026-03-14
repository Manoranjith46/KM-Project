import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AD_Update_Menu.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Loader from "../Resident/Components/Loader/Loader";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";
import useBlockInteraction from "../../hooks/useBlockInteraction";
import { FormFieldError } from "../../Components/FormError";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const inputRefs = useRef({});
  const [error, setError] = useState('');

  // Validate timing format (e.g., "8:00 AM - 10:00 AM" or "08:00-10:00")
  const validateTime = (value, fieldName) => {
    if (!value || !value.trim()) return ''; // Optional field
    // Accept various time formats
    const timePattern = /^[\d:.\s\-aAmMpP]+$/;
    if (!timePattern.test(value.trim())) {
      return `${fieldName} should be a valid time format (e.g., "8:00 AM - 10:00 AM")`;
    }
    return '';
  };

  const validateField = (field, value) => {
    if (field.includes('Time')) {
      const mealName = field.replace('Time', '');
      return validateTime(value, `${mealName.charAt(0).toUpperCase() + mealName.slice(1)} time`);
    }
    return '';
  };

  const handleBlur = (fieldName) => () => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const form = weekForms[selectedDay];
    setFieldErrors(prev => ({ ...prev, [fieldName]: validateField(fieldName, form[fieldName]) }));
  };

  const focusField = (fieldName) => () => {
    if (inputRefs.current[fieldName]) {
      inputRefs.current[fieldName].focus();
    }
  };


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
    const { name, value } = e.target;
    setWeekForms((prev) => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], [name]: value },
    }));
    setError('');
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleGoBack = () => {
    navigate('/admin/kitchen');
  };

  const validateAll = () => {
    const form = weekForms[selectedDay];
    const errors = {};
    ['breakfastTime', 'lunchTime', 'dinnerTime'].forEach(field => {
      const err = validateField(field, form[field]);
      if (err) errors[field] = err;
    });

    setFieldErrors(errors);
    setTouched({ breakfastTime: true, lunchTime: true, dinnerTime: true });

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      if (inputRefs.current[firstErrorField]) {
        inputRefs.current[firstErrorField].focus();
      }
      return false;
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
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
      setError(err.response?.data?.message || "Failed to publish menu. Please try again.");
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

            {error && <div className="form-error-box">{error}</div>}

            {/* 1. Breakfast Section */}
            <section className={`${styles.mealSection} ${styles.mealOrange}`}>
              <div className={styles.mealHeader}>
                <h3 className={styles.mealTitle}>Breakfast</h3>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="breakfastTime">Service Timings</label>
                  <input
                    ref={(el) => inputRefs.current.breakfastTime = el}
                    id="breakfastTime"
                    name="breakfastTime"
                    className={`${styles.input} ${touched.breakfastTime && fieldErrors.breakfastTime ? 'input-error' : ''}`}
                    value={form.breakfastTime}
                    onChange={handleChange}
                    onBlur={handleBlur('breakfastTime')}
                    placeholder="e.g., 8:00 AM - 10:00 AM"
                  />
                  <FormFieldError error={touched.breakfastTime && fieldErrors.breakfastTime} onFocus={focusField('breakfastTime')} />
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
                  <input
                    ref={(el) => inputRefs.current.lunchTime = el}
                    id="lunchTime"
                    name="lunchTime"
                    className={`${styles.input} ${touched.lunchTime && fieldErrors.lunchTime ? 'input-error' : ''}`}
                    value={form.lunchTime}
                    onChange={handleChange}
                    onBlur={handleBlur('lunchTime')}
                    placeholder="e.g., 12:00 PM - 2:00 PM"
                  />
                  <FormFieldError error={touched.lunchTime && fieldErrors.lunchTime} onFocus={focusField('lunchTime')} />
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
                  <input
                    ref={(el) => inputRefs.current.dinnerTime = el}
                    id="dinnerTime"
                    name="dinnerTime"
                    className={`${styles.input} ${touched.dinnerTime && fieldErrors.dinnerTime ? 'input-error' : ''}`}
                    value={form.dinnerTime}
                    onChange={handleChange}
                    onBlur={handleBlur('dinnerTime')}
                    placeholder="e.g., 7:00 PM - 9:00 PM"
                  />
                  <FormFieldError error={touched.dinnerTime && fieldErrors.dinnerTime} onFocus={focusField('dinnerTime')} />
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
