import { useState, useEffect } from "react";
import styles from "./AD_View_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Loader from "../Resident/Components/Loader/Loader";
import Popup from "./Components/Popup/Popup";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";
import useBlockInteraction from "../../hooks/useBlockInteraction";

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
    navigate(-1);
  };

  // Get payment data from navigation state or use mock data
  const raw = location.state?.payment || {};
  const payment = {
    id: raw.id || raw._id || "TXN-00000",
    residentName: raw.residentName || raw.name || "Unknown",
    room: raw.room || "-",
    mobile: raw.mobile || raw.phoneNumber || "-",
    amount: raw.amount != null ? raw.amount : "-",
    date: raw.date || "-",
    time: raw.time || "",
    appName: raw.appName || raw.paymentMethod || raw.mode || "-",
    utr: raw.utr || "-",
    status: raw.status || "pending",
    screenshotUrl: raw.screenshotUrl || null,
    paymentProof: raw.paymentProof || null,
    paymentMethod: raw.paymentMethod || raw.appName || "-",
  };

  const [actionLoading, setActionLoading] = useState(false);
  useBlockInteraction(actionLoading);
  const [popup, setPopup] = useState({ isOpen: false, type: "info", title: "", message: "" });

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await minDelay(API.patch(`/payments/${payment.id}/status`, { status: "approved" }));
      navigate('/admin/payments');
    } catch {
      setPopup({ isOpen: true, type: "error", title: "Action Failed", message: "Could not approve payment. Please try again." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscard = () => {
    setPopup({ isOpen: true, type: "confirm", title: "Reject Payment?", message: "Are you sure you want to reject this payment? This action cannot be undone." });
  };

  const confirmReject = async () => {
    setPopup({ ...popup, isOpen: false });
    try {
      setActionLoading(true);
      await minDelay(API.patch(`/payments/${payment.id}/status`, { status: "rejected" }));
      navigate('/admin/payments');
    } catch {
      setPopup({ isOpen: true, type: "error", title: "Action Failed", message: "Could not reject payment. Please try again." });
    } finally {
      setActionLoading(false);
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
                <span className={styles.statusBadge} data-status={payment.status}>
                  {payment.status === "approved" ? "✓ Approved" : payment.status === "rejected" ? "✕ Rejected" : "⏳ Pending Verification"}
                </span>
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
                {payment.paymentProof ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/'}api/uploads/${payment.paymentProof}`}
                    alt="Payment proof"
                    className={styles.proofImage}
                  />
                ) : (
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
                )}

                {payment.paymentProof && (
                <button
                  className={styles.enlargeBtn}
                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/'}api/uploads/${payment.paymentProof}`, '_blank')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/>
                    <polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/>
                    <line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                  View Full Size
                </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionsFooter}>
              {payment.status === "pending" && (
                <>
                  <button className={styles.btnDiscard} onClick={handleDiscard} disabled={actionLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Discard & Reject
              </button>
              <button className={styles.btnApprove} onClick={handleApprove} disabled={actionLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Approve Payment
              </button>
                </>
              )}
              {payment.status === "approved" && (
                <button className={styles.btnDiscard} onClick={handleDiscard} disabled={actionLoading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Reject Payment
                </button>
              )}
              {payment.status === "rejected" && (
                <button className={styles.btnApprove} onClick={handleApprove} disabled={actionLoading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Approve Payment
                </button>
              )}
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
      {actionLoading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Processing..." />
          </div>
        </div>
      )}
      <Popup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        onConfirm={confirmReject}
        confirmText="Reject"
        cancelText="Cancel"
      />
    </div>
  );
}

