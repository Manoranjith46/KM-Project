import { useState, useEffect } from "react";
import styles from "./AD_Record_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";

export default function Admin_Record_Payment() {

  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("payments");
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("manual"); // 'manual' or 'verify'

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

  const handleViewPayment = (txn) => {
    navigate('/admin/payments/view', { state: { payment: txn } });
  };

  // Mock data for pending UPI verifications
  const pendingUPIList = [
    {
      id: "TXN-84729",
      residentName: "Priya Patel",
      room: "205",
      mobile: "9876543210",
      amount: "8,500",
      date: "27 Feb 2026",
      time: "10:35 AM",
      appName: "Google Pay",
      utr: "305819283746",
    },
    {
      id: "TXN-86211",
      residentName: "Rahul Sharma",
      room: "101",
      mobile: "9123456789",
      amount: "7,200",
      date: "26 Feb 2026",
      time: "7:18 PM",
      appName: "PhonePe",
      utr: "998173552901",
    },
    {
      id: "TXN-87003",
      residentName: "Vikram Singh",
      room: "204",
      mobile: "9988776655",
      amount: "9,000",
      date: "25 Feb 2026",
      time: "9:04 AM",
      appName: "Paytm",
      utr: "443901225871",
    },
    {
      id: "TXN-86212",
      residentName: "Rahul Sharma",
      room: "101",
      mobile: "9123456789",
      amount: "7,200",
      date: "26 Feb 2026",
      time: "7:18 PM",
      appName: "PhonePe",
      utr: "998173552901",
    },
    {
      id: "TXN-87004",
      residentName: "Vikram Singh",
      room: "204",
      mobile: "9988776655",
      amount: "9,000",
      date: "25 Feb 2026",
      time: "9:04 AM",
      appName: "Paytm",
      utr: "443901225871",
    },
  ];

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
            
            {/* Mode Tabs */}
            <div className={styles.tabsRow}>
              <button 
                className={`${styles.tabBtn} ${activeTab === "manual" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("manual")}
              >
                Log Cash Payment
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === "verify" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("verify")}
              >
                Verify UPI Payments
                <span className={styles.badgeCount}>{pendingUPIList.length}</span>
              </button>
            </div>

            {/* TAB 1: MANUAL CASH ENTRY */}
            {activeTab === "manual" && (
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
                  <hr className={styles.divider} />
                  <div className={styles.footerActions}>
                    <button className={styles.cancelBtn} onClick={handleGoBack}>Cancel</button>
                    <button className={styles.saveBtn}>Record Cash Payment</button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: UPI VERIFICATION */}
            {activeTab === "verify" && (
              <div className={styles.tabContentFade}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>Pending UPI Verifications</h3>
                  <p className={styles.formSubtext}>Review screenshots uploaded by residents to approve their payments.</p>
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.paymentsTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Mobile Number</th>
                        <th>Room</th>
                        <th>Amount Paid</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUPIList.map((txn) => (
                        <tr key={txn.id}>
                          <td>{txn.residentName}</td>
                          <td>{txn.mobile}</td>
                          <td>Room {txn.room}</td>
                          <td>₹{txn.amount}</td>
                          <td>
                            <button 
                              className={styles.btnView}
                              onClick={() => handleViewPayment(txn)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

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
    </div>
  );
}
