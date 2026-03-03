import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RD_Finance.module.css";

export default function Resident_Finance() {
  const navigate = useNavigate();
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // --- NEW STATE: Tracks which tab is active ---
  const [paymentMethod, setPaymentMethod] = useState("manual"); // 'manual' or 'online'

  const [paymentData, setPaymentData] = useState({
    amount: "",
    month: currentMonth,
    receipt: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [receiptPreview, setReceiptPreview] = useState("");
  const fileInputRef = useRef(null);

  // Mock History Data
  const [history] = useState([
    { id: 1, month: "February 2026", amount: "₹6,500", date: "02 Feb 2026", paymentMethod: "UPI", status: "Approved" },
    { id: 2, month: "January 2026", amount: "₹6,500", date: "05 Jan 2026", paymentMethod: "Bank Transfer", status: "Approved" },
    { id: 3, month: "December 2025", amount: "₹6,500", date: "01 Dec 2025", paymentMethod: "Screenshot Upload", status: "Approved" },
    { id: 4, month: "February 2026", amount: "₹6,500", date: "02 Feb 2026", paymentMethod: "UPI", status: "Approved" },
    { id: 5, month: "January 2026", amount: "₹6,500", date: "05 Jan 2026", paymentMethod: "Bank Transfer", status: "Approved" },
    { id: 6, month: "December 2025", amount: "₹6,500", date: "01 Dec 2025", paymentMethod: "Screenshot Upload", status: "Approved" },
  ]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPaymentData({ ...paymentData, receipt: selectedFile });
      setReceiptPreview((previousPreview) => {
        if (previousPreview) {
          URL.revokeObjectURL(previousPreview);
        }
        return URL.createObjectURL(selectedFile);
      });
    }
  };

  const handleClearReceipt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptPreview("");
    setPaymentData({ ...paymentData, receipt: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("Receipt uploaded! Awaiting admin approval.");
      setPaymentData({ amount: "", month: currentMonth, receipt: null });
      setReceiptPreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  // --- NEW HANDLER: For the Automated Gateway ---
  const handleOnlinePayment = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock Gateway Call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("Payment successful! Dues cleared instantly.");
      setPaymentData({ amount: "", month: currentMonth, receipt: null });
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* THE EMERALD BLOBS */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <div className={styles.container}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Finance & Payments</h1>
            <p className={styles.subTitle}>Manage your dues and history</p>
          </div>
        </header>

        {successMsg && (
          <div className={styles.successToast}>
            <span>✅</span> {successMsg}
          </div>
        )}

        <div className={styles.mainGrid}>
          
          {/* LEFT COLUMN: UPLOAD FORM */}
          <div className={styles.leftCol}>
            <div className={styles.glassCard}>
              <h2 className={styles.cardTitle}>Pay Rent / Dues</h2>
              <p className={styles.cardDesc}>Choose your preferred payment method.</p>
              
              {/* --- NEW TAB SWITCHER --- */}
              <div className={styles.paymentTabs}>
                <button 
                  className={`${styles.tabButton} ${paymentMethod === 'manual' ? styles.tabActive : ''}`}
                  onClick={() => setPaymentMethod('manual')}
                >
                  Upload Screenshot
                </button>
                <button 
                  className={`${styles.tabButton} ${paymentMethod === 'online' ? styles.tabActive : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  Pay Online (Auto)
                </button>
              </div>

              {/* --- CONDITIONAL RENDERING BASED ON TAB --- */}
              {paymentMethod === 'manual' ? (
                
                // EXISTING MANUAL UPLOAD FORM
                <>

                  <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Amount Paid (₹)</label>
                        <input 
                          type="number" 
                          className={styles.inputField} 
                          placeholder="e.g. 6500"
                          required
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                        />
                      </div>
                      
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>For Month</label>
                        <div className={styles.selectWrapper}>
                          <select 
                            className={styles.inputField} 
                            required
                            value={currentMonth}
                            disabled
                          >
                            <option value={currentMonth}>{currentMonth}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Upload Screenshot</label>
                      <label className={styles.uploadZone}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className={styles.hiddenInput} 
                          required
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                        <div className={styles.uploadContent}>
                          {receiptPreview ? (
                            <>
                              <img
                                src={receiptPreview}
                                alt="Uploaded receipt"
                                className={styles.uploadPreview}
                              />
                              <span className={styles.uploadText}>{paymentData.receipt?.name}</span>
                              <button
                                type="button"
                                className={styles.clearPreviewBtn}
                                onClick={handleClearReceipt}
                              >
                                Clear image
                              </button>
                            </>
                          ) : (
                            <>
                              <div className={styles.uploadIcon}>🧾</div>
                              <span className={styles.uploadText}>Tap to attach screenshot</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                      {isSubmitting ? <span className={styles.loader}></span> : "Submit Receipt"}
                    </button>
                  </form>
                </>

              ) : (

                // NEW AUTOMATED GATEWAY FORM
                <form onSubmit={handleOnlinePayment} className={styles.formContainer}>
                  
                  <div className={styles.gatewayInfo}>
                    <span className={styles.gatewayIcon}>⚡</span>
                    <div>
                      <p className={styles.gatewayTitle}>Zero Fee UPI Payment</p>
                      <small className={styles.gatewaySub}>Instant approval via Gateway.</small>
                    </div>
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Amount to Pay (₹)</label>
                      <input 
                        type="number" 
                        className={styles.inputField} 
                        placeholder="e.g. 6500"
                        required
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>For Month</label>
                      <div className={styles.selectWrapper}>
                        <select 
                          className={styles.inputField} 
                          required
                          value={currentMonth}
                          disabled
                        >
                          <option value={currentMonth}>{currentMonth}</option>
                        </select>
                        <div className={styles.selectArrow}>▼</div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? <span className={styles.loader}></span> : "Pay via Gateway"}
                  </button>

                </form>

              )}

            </div>
          </div>

          {/* RIGHT COLUMN: STATS & HISTORY (Untouched) */}
          <div className={styles.rightCol}>
            
            <div className={styles.statsGrid}>
              <div className={`${styles.glassCard} ${styles.statCard}`}>
                <p className={styles.statLabel}>Total Spendings</p>
                <h3 className={styles.statValue}>₹45,500</h3>
              </div>
              <div className={`${styles.glassCard} ${styles.statCard}`}>
                <p className={styles.statLabel}>Current Dues</p>
                <h3 className={`${styles.statValue} ${styles.textGreen}`}>₹0</h3>
              </div>
            </div>

            <div className={`${styles.glassCard} ${styles.historyCard}`}>
              <h2 className={styles.cardTitle}>Payment History</h2>
              
              <div className={styles.historyList}>
                {history.map((tx) => (
                  <div key={tx.id} className={styles.historyItem}>
                    <div className={styles.historyLeft}>
                      <div className={styles.historyIcon}>💸</div>
                      <div>
                        <p className={styles.historyMonth}>{tx.month}</p>
                        <small className={styles.historyDate}>{tx.date}</small>
                      </div>
                    </div>
                    <div className={styles.historyRight}>
                      <p className={styles.historyAmount}>{tx.amount}</p>
                      <span className={styles.methodBadge}>{tx.paymentMethod}</span>
                      <span className={`${styles.statusBadge} ${tx.status === 'Approved' ? styles.badgeGreen : styles.badgePending}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}