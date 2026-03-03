import { useState, useEffect } from "react";
import styles from "./AD_View_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export default function Admin_View_Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeNav, setActiveNav] = useState("payments");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleGoBack = () => {
    navigate('/admin/record-payment');
  };

  // Get payment data from navigation state or use mock data
  const payment = location.state?.payment || {
    id: "TXN-84729",
    residentName: "Priya Patel",
    room: "205",
    mobile: "9876543210",
    amount: "8,500",
    date: "27 Feb 2026",
    time: "10:35 AM",
    appName: "Google Pay",
    utr: "305819283746",
    screenshotUrl: null, // Would contain actual image URL
  };

  const handleApprove = () => {
    // Handle approve logic
    console.log("Payment approved:", payment.id);
    alert("Payment approved successfully!");
    navigate('/admin/record-payment');
  };

  const handleDiscard = () => {
    // Handle discard logic
    console.log("Payment discarded:", payment.id);
    if (confirm("Are you sure you want to discard this payment?")) {
      alert("Payment discarded!");
      navigate('/admin/record-payment');
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
              <h1 className={styles.pageTitle}>Review UPI Payment</h1>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.paymentContainer}>
            
            {/* Payment Details Card */}
            <div className={styles.detailsCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Payment Information</h3>
                <span className={styles.statusBadge}>Pending Verification</span>
              </div>

              <div className={styles.residentSection}>
                <div className={styles.avatar}>
                  {payment.residentName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div className={styles.residentInfo}>
                  <h4 className={styles.residentName}>{payment.residentName}</h4>
                  <p className={styles.residentDetail}>Room {payment.room}</p>
                  <p className={styles.residentDetail}>📱 {payment.mobile}</p>
                </div>
              </div>

              <div className={styles.paymentGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Transaction ID</span>
                  <span className={styles.infoValue}>{payment.utr}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Payment Amount</span>
                  <span className={styles.infoValueAmount}>₹{payment.amount}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Payment App</span>
                  <span className={styles.infoValue}>
                    <span className={styles.upiIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12" y2="18"/>
                      </svg>
                    </span>
                    {payment.appName}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Date & Time</span>
                  <span className={styles.infoValue}>
                    {payment.date}<br />
                    {payment.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Screenshot Proof Card */}
            <div className={styles.proofCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Payment Screenshot</h3>
              </div>

              <div className={styles.screenshotWrapper}>
                {/* Mock Receipt */}
                <div className={styles.mockReceipt}>
                  <div className={styles.mockReceiptHeader}>
                    <span>{payment.appName}</span>
                    <span className={styles.successBadge}>✓ Successful</span>
                  </div>
                  <div className={styles.mockReceiptBody}>
                    <p className={styles.receiptLabel}>Paid to</p>
                    <h3 className={styles.receiptMerchant}>PG-Ease Hostels</h3>
                    <h1 className={styles.receiptAmount}>₹{payment.amount}</h1>
                    <p className={styles.receiptUtr}>UTR: {payment.utr}</p>
                    <p className={styles.receiptDate}>{payment.date} at {payment.time}</p>
                  </div>
                </div>

                <button className={styles.enlargeBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/>
                    <polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/>
                    <line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                  View Full Size
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionsFooter}>
              <button className={styles.btnDiscard} onClick={handleDiscard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Discard & Reject
              </button>
              <button className={styles.btnApprove} onClick={handleApprove}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Approve Payment
              </button>
            </div>

          </div>
        </div>
      </main>

      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
          <button className={styles.bottomNavItem} onClick={() => setActiveNav('dashboard')}>
            <span className={styles.bottomNavIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </span>
            <span className={styles.bottomNavLabel}>Dashboard</span>
          </button>
          <button className={`${styles.bottomNavItem} ${styles.bottomNavItemActive}`} onClick={() => setActiveNav('payments')}>
            <span className={styles.bottomNavIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </span>
            <span className={styles.bottomNavLabel}>Payments</span>
          </button>
        </nav>
      )}
    </div>
  );
}

