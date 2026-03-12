import { useState, useEffect, useCallback } from "react";
import styles from "./AD_Verify_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import { VerifyPaymentSkeleton } from "./Components/Skeleton/Skeleton";
import { useNavigate } from "react-router-dom";
import API from "../../API/axios";

export default function Admin_Verify_Payment() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  const fetchPending = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await API.get("/payments");
      const all = Array.isArray(data) ? data : data.payments || [];
      const pending = all.filter((p) => p.status === "pending");
      setPendingPayments(pending);
    } catch (err) {
      console.error("Failed to fetch pending payments:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleGoBack = () => {
    navigate("/admin/payments");
  };

  const handleViewPayment = (txn) => {
    navigate("/admin/payments/view", { state: { payment: txn } });
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath="payments" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
              <h1 className={styles.pageTitle}>Verify Payments</h1>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Pending UPI Verifications</h3>
              <p className={styles.formSubtext}>
                Review screenshots uploaded by residents to approve their payments.
              </p>
            </div>

            {isLoading ? (
              <VerifyPaymentSkeleton />
            ) : pendingPayments.length === 0 ? (
              <p className={styles.emptyText}>No pending payments to verify.</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.paymentsTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile Number</th>
                      <th>Amount Paid</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.map((txn) => (
                      <tr key={txn._id}>
                        <td>{txn.name}</td>
                        <td>{txn.phoneNumber}</td>
                        <td>&#8377;{Number(txn.amount).toLocaleString("en-IN")}</td>
                        <td>
                          {new Date(txn.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
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
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
