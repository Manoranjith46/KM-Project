import { useState, useEffect } from "react";
import styles from "./AD_Record_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Loader from "./Components/Loader/Loader";
import { useNavigate } from "react-router-dom";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";

export default function Admin_Record_Payment() {

  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("payments");
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form state for Manual Cash Entry
  const [cashForm, setCashForm] = useState({
    resident: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleCashChange = (e) => {
    setCashForm({ ...cashForm, [e.target.name]: e.target.value });
  };

  const handleGoBack = () => {
    navigate('/admin/payments');
  };

  const handleSubmitCash = async () => {
    setError("");
    if (!cashForm.resident || !cashForm.amount) {
      setError("Mobile number and amount are required.");
      return;
    }
    try {
      setIsSubmitting(true);
      await minDelay((async () => {
        const { data: occData } = await API.get("/admin/occupants");
        const match = (occData.occupants || []).find(
          (r) => r.phoneNumber === cashForm.resident
        );
        if (!match) {
          setError("No resident found with this mobile number.");
          return;
        }
        await API.post("/payments/cash", {
          name: match.name,
          phoneNumber: cashForm.resident,
          amount: Number(cashForm.amount),
          date: cashForm.date || new Date().toISOString(),
        });
        navigate("/admin/payments");
      })());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
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

      <Sidebar currentPath={"payments"} />

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.backBtn} onClick={handleGoBack} aria-label="Go Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Record Payment</h1>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.formContainer}>
            
              <div className={styles.tabContentFade}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>Manual Cash Entry</h3>
                  <p className={styles.formSubtext}>Record a payment received in cash directly from a resident.</p>
                </div>

                <div className={styles.formGrid}>
                  <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="resident">Resident Mobile Number</label>
                    <input
                      id="resident"
                      name="resident"
                      type="tel"
                      className={styles.input}
                      placeholder="e.g. 9876543210"
                      value={cashForm.resident}
                      onChange={handleCashChange}
                    />
                  </div>
                  
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="amount">Amount Received (₹)</label>
                    <input id="amount" name="amount" type="number" className={styles.input} placeholder="e.g. 8500" value={cashForm.amount} onChange={handleCashChange} />
                  </div>
                  
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="date">Payment Date</label>
                    <input id="date" name="date" type="date" className={styles.input} value={cashForm.date} onChange={handleCashChange} />
                  </div>

                  <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="notes">Remarks / Notes (Optional)</label>
                    <input id="notes" name="notes" className={styles.input} placeholder="e.g. Paid in full for Feb" value={cashForm.notes} onChange={handleCashChange} />
                  </div>
                </div>

                <div className={styles.formFooter}>
                  {error && <p className={styles.errorText}>{error}</p>}
                  <hr className={styles.divider} />
                  <div className={styles.footerActions}>
                    <button className={styles.cancelBtn} onClick={handleGoBack}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSubmitCash} disabled={isSubmitting}>
                      {isSubmitting ? "Recording..." : "Record Cash Payment"}
                    </button>
                  </div>
                </div>
              </div>

          </div>
        </div>
      </main>

      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
            <button className={styles.bottomNavItem} onClick={() => setActiveNav('dashboard')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Dashboard</span>
            </button>
            <button className={`${styles.bottomNavItem} ${styles.bottomNavItemActive}`} onClick={() => setActiveNav('payments')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Payments</span>
            </button>
        </nav>
      )}
      {isSubmitting && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Recording..." />
          </div>
        </div>
      )}
    </div>
  );
}
